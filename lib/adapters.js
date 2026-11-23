// Bridges the board UI (lib/board.js) to Supabase and the app's API routes.
// The board talks to a small Firestore-like surface: collection(c).onSnapshot, doc("c/id").set/delete.

const SPEC = {
  tasks: { pk: "id", fields: { title: "t", area: "t", due: ["due", "d"], done: "b", doneOn: ["done_on", "d"], order: ["sort_order", "n"], person: "t", note: "t", source: "t", created: "ts", atTime: ["at_time", "t"], remindMin: ["remind_min", "ni"], alarm: "b", repeat: "t", priority: "t", claude: "t", estimateMin: ["estimate_min", "ni"], guideWhat: ["guide_what", "t"], guideWhy: ["guide_why", "t"], guideSteps: ["guide_steps", "t"], guideDone: ["guide_done", "t"] } },
  people: { pk: "id", fields: { name: "t", org: "t", area: "t", contact: "t", followUp: ["follow_up", "d"], lastContact: ["last_contact", "d"], note: "t" } },
  notes: { pk: "user_id,id", fields: { text: "t", updated: "ts" } },
  plans: { pk: "user_id,id", fields: { brief: "t", blocks: "j", created: "ts" } },
  builds: { pk: "id", fields: { area: "t", size: "t", title: "t", summary: "t", points: "j", openItems: ["open_items", "t"], live: "b", link: "t", day: ["day", "d"], atTime: ["at_time", "t"], created: "ts" } },
  recaps: { pk: "user_id,id", fields: { text: "t", areas: "o", buildCount: ["build_count", "ni"], created: "ts" } },
  areas: { pk: "user_id,id", fields: { name: "t", short: "t", color: "t", icon: "t", logo: "t", about: "t", order: ["sort_order", "n"], archived: "b", updated: "ts" } },
  health_logs: { pk: "user_id,id", fields: { day: "d", kind: "t", key: "t", data: "j", created: "ts" } },
};

function colOf(key, def) { return Array.isArray(def) ? def : [key, def]; }

function toRow(coll, id, obj, userId) {
  const row = { id, user_id: userId };
  for (const [key, def] of Object.entries(SPEC[coll].fields)) {
    const [col, type] = colOf(key, def);
    const v = obj[key];
    if (type === "d") row[col] = v ? v : null;
    else if (type === "ts") row[col] = v || new Date().toISOString();
    else if (type === "b") row[col] = !!v;
    else if (type === "n") row[col] = Number(v) || Date.now();
    else if (type === "ni") row[col] = v === "" || v == null || isNaN(Number(v)) ? null : Number(v);
    else if (type === "j") row[col] = v || [];
    else if (type === "o") row[col] = v || {};
    else row[col] = v == null ? "" : String(v);
  }
  return row;
}

function fromRow(coll, row) {
  const obj = {};
  for (const [key, def] of Object.entries(SPEC[coll].fields)) {
    const [col, type] = colOf(key, def);
    const v = row[col];
    if (type === "d") obj[key] = v || "";
    else if (type === "b") obj[key] = !!v;
    else if (type === "n") obj[key] = Number(v) || 0;
    else if (type === "ni") obj[key] = v == null ? null : Number(v);
    else if (type === "j") obj[key] = v || [];
    else if (type === "o") obj[key] = v || {};
    else obj[key] = v == null ? "" : v;
  }
  return obj;
}

export function makeDb(sb, userId) {
  let pending = 0;
  const waiters = [];
  function settle() { if (pending === 0) while (waiters.length) waiters.shift()(); }
  function idle() { return pending === 0 ? Promise.resolve() : new Promise((r) => waiters.push(r)); }

  async function fetchAll(coll) {
    let q = sb.from(coll).select("*");
    if (coll === "tasks") {
      const cutoff = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
      q = q.or(`done.eq.false,done_on.gte.${cutoff}`);
    }
    if (coll === "health_logs") {
      const cutoff = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);
      q = q.gte("day", cutoff);
    }
    if (coll === "plans") {
      const cutoff = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
      q = q.gte("id", cutoff);
    }
    if (coll === "builds" || coll === "recaps") {
      const cutoff = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
      q = q.gte(coll === "builds" ? "day" : "id", cutoff);
    }
    const { data, error } = await q.limit(5000);
    if (error) throw error;
    return data;
  }

  return {
    collection(coll) {
      return {
        onSnapshot(next, onError) {
          let timer = null, alive = true;
          async function load() {
            await idle();
            try {
              const rows = await fetchAll(coll);
              if (!alive) return;
              next({ docs: rows.map((r) => ({ id: r.id, data: () => fromRow(coll, r) })), metadata: { fromCache: false } });
            } catch (e) { if (alive && onError) onError({ code: "unavailable", message: e.message }); }
          }
          load();
          const channel = sb.channel("db-" + coll)
            .on("postgres_changes", { event: "*", schema: "public", table: coll }, () => {
              clearTimeout(timer); timer = setTimeout(load, 350);
            })
            .subscribe();
          const onFocus = () => { if (document.visibilityState === "visible") load(); };
          document.addEventListener("visibilitychange", onFocus);
          return () => { alive = false; clearTimeout(timer); sb.removeChannel(channel); document.removeEventListener("visibilitychange", onFocus); };
        },
      };
    },
    doc(path) {
      const [coll, id] = path.split("/");
      return {
        async set(obj) {
          pending++;
          try {
            const { error } = await sb.from(coll).upsert(toRow(coll, id, obj, userId), { onConflict: SPEC[coll].pk });
            if (error) throw { code: "unavailable", message: error.message };
          } finally { pending--; settle(); }
        },
        async delete() {
          pending++;
          try {
            const { error } = await sb.from(coll).delete().eq("id", id);
            if (error) throw { code: "unavailable", message: error.message };
          } finally { pending--; settle(); }
        },
      };
    },
  };
}

async function authedFetch(sb, url, init) {
  const { data } = await sb.auth.getSession();
  const token = data.session && data.session.access_token;
  const res = await fetch(url, { ...init, headers: { ...(init && init.headers), Authorization: "Bearer " + token, "Content-Type": "application/json" } });
  let body = null;
  try { body = await res.json(); } catch (_) {}
  if (!res.ok) throw { code: (body && body.error) || "unavailable", message: (body && body.message) || res.statusText, status: res.status };
  return body;
}

export function makeSample(sb) {
  return {
    json(prompt, opts) {
      return authedFetch(sb, "/api/ai", { method: "POST", body: JSON.stringify({ prompt, tier: (opts && opts.modelTier) || "default" }) }).then((b) => b.result);
    },
  };
}

// Phone notifications: registers the service worker and sends the push subscription to the server.
export function makePush(sb) {
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  function b64(s) {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  }
  async function reg() { return navigator.serviceWorker.register("/sw.js"); }
  return {
    supported,
    permission() { return supported ? Notification.permission : "unsupported"; },
    async current() {
      if (!supported) return null;
      const r = await navigator.serviceWorker.getRegistration("/sw.js");
      return r ? r.pushManager.getSubscription() : null;
    },
    async enable(prefs) {
      if (!supported) throw { code: "unsupported" };
      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw { code: "denied" };
      const r = await reg();
      await navigator.serviceWorker.ready;
      const { publicKey } = await authedFetch(sb, "/api/push/subscribe", { method: "GET" });
      let sub = await r.pushManager.getSubscription();
      if (!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(publicKey) });
      return authedFetch(sb, "/api/push/subscribe", { method: "POST", body: JSON.stringify({ sub: sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, ...(prefs || {}) }) });
    },
    async save(prefs) {
      const sub = await this.current();
      if (!sub) return null;
      return authedFetch(sb, "/api/push/subscribe", { method: "POST", body: JSON.stringify({ sub: sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, ...(prefs || {}) }) });
    },
    async disable() {
      const sub = await this.current();
      if (!sub) return;
      await authedFetch(sb, "/api/push/subscribe", { method: "DELETE", body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
      await sub.unsubscribe();
    },
    test() { return authedFetch(sb, "/api/push/test", { method: "POST", body: "{}" }); },
    alarmsLink() { return authedFetch(sb, "/api/alarms/link", { method: "GET" }); },
    badge(n) { try { if (navigator.setAppBadge) n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } catch (_) {} },
  };
}

export function makeCalendar(sb) {
  return function fetchEvents() {
    return authedFetch(sb, "/api/calendar", { method: "GET" });
  };
}
