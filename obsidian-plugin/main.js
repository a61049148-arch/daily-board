// Daily Board Sync: pulls build log entries and daily recaps from Daily Board (Supabase) into this vault.
// Read-only toward Daily Board. Writes only inside the configured folder; files there are regenerated.
const { Plugin, PluginSettingTab, Setting, Notice, requestUrl, normalizePath, TFile } = require("obsidian");

const AREAS = { truenorth: "True North", dg: "D&G", baselab: "Baselab", personal: "Personal" };
const DEFAULTS = { supabaseUrl: "", anonKey: "", token: "", area: "", folder: "Daily Board", minutes: 10, lastSync: "" };

function pad(n) { return String(n).padStart(2, "0"); }
function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function dayName(s) { const p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString("en-US", { weekday: "short" }); }
function longDay(s) { const p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
function monthName(m) { const p = m.split("-").map(Number); return new Date(p[0], p[1] - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
function clean(s) { return String(s || "").replace(/\r/g, "").trim(); }

function entryMd(b, showArea) {
  const head = "- **" + (b.at_time || "--:--") + "** " + (showArea ? "· " + (AREAS[b.area] || b.area) + " " : "") + "· **" + clean(b.title) + "**" + (b.live ? " · live" : "") + (b.size === "small" ? " · small fixes" : "");
  const out = [head];
  if (b.summary) out.push("  " + clean(b.summary));
  (b.points || []).filter(Boolean).forEach((p) => out.push("  - " + clean(p)));
  if (b.open_items) out.push("  - Still open: " + clean(b.open_items));
  if (b.link) out.push("  - Where: `" + clean(b.link).replace(/`/g, "'") + "`");
  return out.join("\n");
}

module.exports = class DailyBoardSync extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.addSettingTab(new SyncTab(this.app, this));
    this.addCommand({ id: "sync-now", name: "Sync now", callback: () => this.sync(true) });
    this.app.workspace.onLayoutReady(() => this.sync(false));
    this.schedule();
  }
  schedule() {
    if (this.timer) window.clearInterval(this.timer);
    const m = Math.max(2, Number(this.settings.minutes) || 10);
    this.timer = window.setInterval(() => this.sync(false), m * 60000);
    this.registerInterval(this.timer);
  }
  async save() { await this.saveData(this.settings); }

  async fetchFeed(since) {
    const s = this.settings;
    const res = await requestUrl({
      url: s.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/vault_feed",
      method: "POST",
      headers: { apikey: s.anonKey, Authorization: "Bearer " + s.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ tok: s.token, since, only_area: s.area || null }),
      throw: false,
    });
    if (res.status >= 300) throw new Error("Daily Board answered " + res.status + ": " + String(res.text || "").slice(0, 120));
    return res.json;
  }

  async write(path, text) {
    path = normalizePath(path);
    const dir = path.split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) await this.app.vault.createFolder(dir).catch(() => {});
    const f = this.app.vault.getAbstractFileByPath(path);
    if (f instanceof TFile) {
      if ((await this.app.vault.read(f)) === text) return false;
      await this.app.vault.modify(f, text);
    } else await this.app.vault.create(path, text);
    return true;
  }

  async sync(loud) {
    const s = this.settings;
    if (!s.supabaseUrl || !s.anonKey || !s.token) { if (loud) new Notice("Daily Board Sync: add the connection details in settings."); return; }
    if (this.busy) return;
    this.busy = true;
    try {
      const now = new Date(), start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const feed = await this.fetchFeed(ymd(start));
      const builds = feed.builds || [], recaps = feed.recaps || [];
      const root = s.folder || "Daily Board", all = !s.area;
      let changed = 0;

      // Monthly log: one file per month, newest day first.
      const months = {};
      builds.forEach((b) => { (months[b.day.slice(0, 7)] = months[b.day.slice(0, 7)] || []).push(b); });
      for (const [m, list] of Object.entries(months)) {
        const days = [...new Set(list.map((b) => b.day))].sort().reverse();
        let md = "---\ntags: [build-log]\n---\n# Build Log · " + monthName(m) + "\n\n_Written by Daily Board. Edits here are replaced on the next sync; add notes in your daily note instead._\n";
        for (const d of days) {
          md += "\n## [[" + d + "]] (" + dayName(d) + ")\n" + list.filter((b) => b.day === d).sort((a, b) => (a.at_time < b.at_time ? 1 : -1)).map((b) => entryMd(b, all)).join("\n") + "\n";
        }
        if (await this.write(root + "/Build Log/" + m + ".md", md)) changed++;
      }

      // Daily recap notes.
      for (const r of recaps) {
        const text = all ? r.text : (r.areas || {})[s.area];
        const mine = builds.filter((b) => b.day === r.id);
        if (!clean(text) && !mine.length) continue;
        let md = "---\ntags: [daily-recap]\ndate: " + r.id + "\n---\n# " + longDay(r.id) + "\n\n" + clean(text) + "\n";
        if (mine.length) md += "\n## Built\n" + mine.sort((a, b) => (a.at_time < b.at_time ? -1 : 1)).map((b) => entryMd(b, all)).join("\n") + "\n";
        md += "\n[[" + r.id.slice(0, 7) + "|Build Log " + monthName(r.id.slice(0, 7)) + "]]\n";
        if (await this.write(root + "/Recaps/" + r.id + ".md", md)) changed++;
      }

      s.lastSync = new Date().toISOString();
      await this.save();
      if (loud) new Notice("Daily Board Sync: " + (changed ? changed + " note" + (changed === 1 ? "" : "s") + " updated." : "up to date."));
    } catch (e) {
      console.error("Daily Board Sync", e);
      if (loud) new Notice("Daily Board Sync failed: " + (e && e.message ? e.message : e));
    } finally { this.busy = false; }
  }
};

class SyncTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const el = this.containerEl, s = this.plugin.settings, save = async () => { await this.plugin.save(); this.plugin.schedule(); };
    el.empty();
    new Setting(el).setName("Business").setDesc("Which entries this vault receives.").addDropdown((d) => {
      d.addOption("", "All businesses");
      Object.entries(AREAS).forEach(([k, v]) => d.addOption(k, v));
      d.setValue(s.area).onChange(async (v) => { s.area = v; await save(); });
    });
    new Setting(el).setName("Folder").setDesc("Notes are written inside this folder.").addText((t) => t.setValue(s.folder).onChange(async (v) => { s.folder = v.trim() || "Daily Board"; await save(); }));
    new Setting(el).setName("Check every (minutes)").addText((t) => t.setValue(String(s.minutes)).onChange(async (v) => { s.minutes = Number(v) || 10; await save(); }));
    new Setting(el).setName("Supabase URL").addText((t) => t.setValue(s.supabaseUrl).onChange(async (v) => { s.supabaseUrl = v.trim(); await save(); }));
    new Setting(el).setName("Public key").setDesc("The Supabase anon or publishable key.").addText((t) => t.setValue(s.anonKey).onChange(async (v) => { s.anonKey = v.trim(); await save(); }));
    new Setting(el).setName("Access token").setDesc("Lets this vault read your build log. Keep it private.").addText((t) => { t.inputEl.type = "password"; t.setValue(s.token).onChange(async (v) => { s.token = v.trim(); await save(); }); });
    new Setting(el).setName("Sync now").setDesc(s.lastSync ? "Last synced " + new Date(s.lastSync).toLocaleString() : "Not synced yet.").addButton((b) => b.setButtonText("Sync").onClick(() => this.plugin.sync(true)));
  }
}
