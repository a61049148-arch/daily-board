// Demo mode: an in-memory board filled with realistic sample data. Nothing touches Supabase.
// Used by /demo (app/demo/page.js). Data resets on reload.

function pad(n) { return String(n).padStart(2, "0"); }
function ymd(x) { return x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); }
function day(n) { const x = new Date(); x.setDate(x.getDate() + n); return ymd(x); }
function iso(n, h, m) { const x = new Date(); x.setDate(x.getDate() + n); x.setHours(h, m, 0, 0); return x.toISOString(); }
function hm(mins) { return pad(Math.floor(mins / 60)) + ":" + pad(mins % 60); }
function mins(s) { const p = String(s).split(":"); return +p[0] * 60 + +p[1]; }

function task(title, area, due, extra) {
  return Object.assign({ title, area, due, done: false, doneOn: "", order: 0, person: "", note: "", source: "", atTime: "", remindMin: null, alarm: false, repeat: "", created: new Date().toISOString() }, extra || {});
}

export function demoStore() {
  const t = day(0);
  const tasks = {
    t1: task("Edit gym client reel (v2, 30s cut)", "baselab", t, { atTime: "10:00", remindMin: 10, note: "Client wants the hook in the first 1.5s. Use the slow-mo deadlift shot and the new caption style." }),
    t2: task("Call Sarah about the upholstery quote", "dg", t, { atTime: "16:30", remindMin: 10, alarm: true, person: "p1", note: "Sectional + 2 armchairs. Quote was $340. She asked about pet stain treatment." }),
    t3: task("Send weekly invoices", "truenorth", t, { repeat: "weekly", atTime: "17:15", remindMin: 0 }),
    t4: task("Renew van insurance", "dg", day(-3), { note: "Policy ends Friday. Compare the Progressive quote first." }),
    t5: task("Film 3 hooks for the dental client", "baselab", t),
    t6: task("Record lesson 4 voiceover: 'Term vs whole life'", "truenorth", t, { note: "Script is in the course folder. Aim for 6 minutes." }),
    t7: task("Reply to Mia about lesson 4 access", "truenorth", t, { done: true, doneOn: t }),
    t8: task("Post today's reel for Iron Temple Gym", "baselab", t, { atTime: "08:30", done: true, doneOn: t }),
    t9: task("Order more carpet shampoo (2 gallons)", "dg", t),
    t10: task("Book dentist appointment", "personal", day(1)),
    t11: task("Pitch deck for Sunrise Dental", "baselab", day(1), { atTime: "11:00", remindMin: 30 }),
    t12: task("Follow up on Hernandez home quote", "dg", day(2), { person: "p3" }),
    t13: task("Upload lesson 3 to the course site", "truenorth", day(3)),
    t14: task("Plan next month's content calendar", "baselab", day(4)),
    t15: task("Car wash and oil change", "personal", day(5)),
    t16: task("Review True North ad numbers", "truenorth", day(-1), { done: true, doneOn: day(-1) }),
    t17: task("Clean Henderson carpets", "dg", day(-1), { done: true, doneOn: day(-1) }),
  };
  Object.keys(tasks).forEach((k, i) => { tasks[k].order = i + 1; });

  const people = {
    p1: { name: "Sarah Henderson", org: "Residential client", area: "dg", contact: "(555) 201-4410", followUp: t, lastContact: day(-6), note: "Two dogs. Prefers texts." },
    p2: { name: "Marcus Lee", org: "Owner, Iron Temple Gym", area: "baselab", contact: "marcus@irontemple.example", followUp: day(1), lastContact: day(-2), note: "Retainer client, 12 reels a month." },
    p3: { name: "Ana Hernandez", org: "Homeowner, 4 bed", area: "dg", contact: "(555) 778-0192", followUp: day(2), lastContact: day(-4), note: "" },
    p4: { name: "Mia Chen", org: "Course student", area: "truenorth", contact: "mia@example.com", followUp: "", lastContact: t, note: "Licensing exam in March." },
    p5: { name: "Dr. Patel", org: "Sunrise Dental", area: "baselab", contact: "", followUp: day(1), lastContact: day(-9), note: "Interested in 8 videos a month." },
  };

  const notes = {
    baselab: { text: "Retainers: Iron Temple (12/mo), Glow Studio (8/mo).\nPipeline: Sunrise Dental, Coastal Realty.\nHook ideas: 'Your gym is lying to you', 'I tried every pre-workout'.", updated: new Date().toISOString() },
    dg: { text: "Price list: room $45, stairs $3/step, sectional $180.\nVan service due at 98,000 miles.", updated: new Date().toISOString() },
  };

  // A plan for today, as if "Plan my day" already ran.
  const plans = {
    [t]: { brief: "Client work first: the gym reel at 10 and Sarah's quote call this afternoon. Batch the course voiceover into your 3 PM focus block so it actually gets done.", created: new Date().toISOString(),
      blocks: [
        { taskId: "t1", start: "10:00", end: "11:00" },
        { taskId: "t6", start: "15:00", end: "15:50" },
        { taskId: "t2", start: "16:30", end: "16:45" },
        { taskId: "t3", start: "17:15", end: "17:45" },
      ] },
  };

  const now = new Date().toISOString();
  const builds = {
    b1: { area: "baselab", size: "", title: "Gym client reel template", summary: "A reusable 30s reel template in the Motion Studio with captions, hook card and end screen.", points: ["Caption style matches the client's brand", "Hook card with 1.5s timing", "Exports 9:16 and 4:5"], openItems: "", live: true, link: "", day: t, atTime: "09:40", created: now },
    b2: { area: "dg", size: "small", title: "Booking page fixes", summary: "Fixed the date picker on iPhone and added stair pricing to the quote form.", points: ["Date picker works in Safari", "Stairs priced per step"], openItems: "", live: true, link: "https://example.com", day: t, atTime: "08:15", created: now },
    b3: { area: "truenorth", size: "", title: "Lesson 3 video: 'What is a deductible'", summary: "Narration, motion graphics and stock cutaways. 5m 40s.", points: ["ElevenLabs narration", "Six motion graphics", "Final mix at -14 LUFS"], openItems: "Upload to the course site and add the quiz.", live: false, link: "", day: day(-1), atTime: "18:20", created: now },
    b4: { area: "personal", size: "", title: "Daily Board: Today page redesign", summary: "List-style schedule with a now line, a Next up card and an Anytime list.", points: ["Schedule shows meals and free gaps", "One tap to finish the next task"], openItems: "", live: true, link: "https://daily-board-rho.vercel.app", day: day(-1), atTime: "14:05", created: now },
    b5: { area: "baselab", size: "", title: "Sunrise Dental pitch outline", summary: "Pitch structure, three sample hooks and pricing for 8 videos a month.", points: ["Three hook angles", "Pricing tiers"], openItems: "Finish the deck tomorrow.", live: false, link: "", day: day(-2), atTime: "16:00", created: now },
    b6: { area: "dg", size: "", title: "Follow-up text agent", summary: "Texts customers 3 days after a job asking for a review.", points: ["Review link in the message", "Stops if the customer replies STOP"], openItems: "", live: true, link: "", day: day(-3), atTime: "11:30", created: now },
    b7: { area: "truenorth", size: "small", title: "Course landing page copy", summary: "Rewrote the hero and FAQ.", points: [], openItems: "", live: true, link: "", day: day(-4), atTime: "10:10", created: now },
    b8: { area: "baselab", size: "", title: "Content calendar for Glow Studio", summary: "Four weeks of posts with hooks and shoot days.", points: ["16 posts", "Two shoot days"], openItems: "", live: false, link: "", day: day(-5), atTime: "15:45", created: now },
    b9: { area: "personal", size: "small", title: "Health HQ meal times", summary: "Meals now show on the Today schedule.", points: [], openItems: "", live: true, link: "", day: day(-6), atTime: "20:30", created: now },
  };
  const recaps = {
    [day(-1)]: { text: "A full day across three areas. Lesson 3 is rendered and waiting for upload, and the Today page redesign is live.\n\nOpen: upload lesson 3 and add its quiz.", areas: { truenorth: "Lesson 3 is rendered. Upload it and add the quiz next.", personal: "Today page redesign shipped." }, buildCount: 2, created: now },
    [day(-3)]: { text: "D&G's follow-up text agent went live, so every finished job now asks for a review automatically.", areas: { dg: "Follow-up text agent is live." }, buildCount: 1, created: now },
  };

  const health_logs = {
    ["m-" + t + "-breakfast"]: { day: t, kind: "meal", key: "breakfast", data: { kcal: 560, protein: 26 }, created: now },
  };
  for (let i = 7; i >= 1; i--) {
    const d = day(-i);
    health_logs["w-" + d] = { day: d, kind: "weight", key: "", data: { lb: (171.2 + (7 - i) * 0.12).toFixed(1) }, created: now };
  }

  return { tasks, people, notes, plans, builds, recaps, health_logs, areas: {} };
}

export function demoEvents() {
  const ev = (n, h, m, h2, m2, summary, extra) => Object.assign({ summary, start: { dateTime: iso(n, h, m) }, end: { dateTime: iso(n, h2, m2) } }, extra || {});
  return [
    ev(0, 7, 0, 8, 0, "Upper A at the gym", { location: "Iron Temple Gym, 220 Harbor Blvd" }),
    ev(0, 9, 0, 9, 30, "Baselab team standup", { location: "Google Meet", description: "Quick round: what's shooting this week, blockers, client feedback." }),
    ev(0, 11, 30, 12, 45, "D&G job: Henderson carpets", { location: "1420 Maple Ave", description: "3 rooms + hallway + stairs (13 steps). Pet stain treatment in the living room. Gate code 4410." }),
    ev(0, 13, 30, 14, 30, "True North: policy review with the Garcias", { location: "Zoom", description: "Review their auto + home bundle. Bring the umbrella policy numbers." }),
    ev(0, 15, 0, 16, 0, "Focus time", { transparency: "transparent" }),
    ev(0, 18, 0, 19, 0, "Boxing", { location: "Westside Boxing Club" }),
    ev(0, 20, 30, 21, 30, "Family dinner", { transparency: "transparent" }),
    ev(1, 9, 0, 9, 30, "Baselab team standup", { location: "Google Meet" }),
    ev(1, 10, 0, 12, 0, "Shoot day: Iron Temple", { location: "Iron Temple Gym" }),
    ev(1, 14, 0, 15, 0, "D&G job: Patel office rugs"),
    ev(2, 9, 0, 9, 30, "Baselab team standup"),
    ev(2, 13, 0, 14, 0, "Sunrise Dental pitch", { location: "Sunrise Dental, 88 Ocean Dr" }),
    ev(3, 10, 0, 13, 0, "D&G job: Hernandez home"),
    ev(4, 16, 0, 17, 0, "True North: new agent onboarding"),
  ];
}

// An in-memory db with the same shape as lib/adapters.js makeDb().
export function demoDb(store) {
  const subs = {};
  const emit = (c) => (subs[c] || []).forEach((f) => f({ docs: Object.entries(store[c] || {}).map(([id, v]) => ({ id, data: () => JSON.parse(JSON.stringify(v)) })) }));
  return {
    collection: (c) => ({ onSnapshot(next) { (subs[c] = subs[c] || []).push(next); setTimeout(() => emit(c), 30); return () => {}; } }),
    doc: (p) => {
      const [c, id] = p.split("/");
      return {
        async set(o) { (store[c] = store[c] || {})[id] = JSON.parse(JSON.stringify(o)); setTimeout(() => emit(c), 5); },
        async delete() { if (store[c]) delete store[c][id]; setTimeout(() => emit(c), 5); },
      };
    },
  };
}

// Stand-in for Claude so Plan my day and Brain dump work offline.
export function demoSample() {
  function grab(prompt, label) {
    const line = prompt.split("\n").find((l) => l.startsWith(label));
    try { return JSON.parse(line.slice(label.length)); } catch (_) { return []; }
  }
  function plan(prompt) {
    const m = /Schedule work from (\d{1,2})(?::(\d{2}))? (AM|PM)/.exec(prompt);
    let at = m ? ((+m[1] % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + +(m[2] || 0) : 9 * 60;
    const busy = grab(prompt, "Calendar events: ").filter((e) => e.start && !e.flexible && !e.focusSlot).map((e) => [mins(e.start), mins(e.end) + 10]);
    const tasks = grab(prompt, "Open tasks: ");
    const blocks = [];
    const fixed = tasks.filter((t) => t.fixedTime);
    fixed.forEach((t) => { const s = mins(t.fixedTime); blocks.push({ taskId: t.id, start: hm(s), end: hm(s + 30) }); busy.push([s, s + 30]); });
    tasks.filter((t) => !t.fixedTime).sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0)).forEach((t) => {
      const len = /invoice|order|reply|book|text|email/i.test(t.title) ? 20 : 45;
      for (let guard = 0; guard < 60 && at + len <= 21 * 60; guard++) {
        const hit = busy.find(([s, e]) => at < e && at + len > s);
        if (!hit) { blocks.push({ taskId: t.id, start: hm(at), end: hm(at + len) }); busy.push([at, at + len]); at += len + 10; return; }
        at = Math.ceil(hit[1] / 15) * 15;
      }
    });
    return { brief: "Overdue and client work go first so nothing slips. Short admin tasks are grouped together near the end of the day.", blocks };
  }
  function dump(prompt) {
    const text = prompt.split("Brain dump:\n")[1] || "";
    const guess = (s) => /reel|hook|film|post|client|content|shoot/i.test(s) ? "baselab" : /carpet|clean|van|rug|stain|quote/i.test(s) ? "dg" : /lesson|course|policy|insurance|agent/i.test(s) ? "truenorth" : "personal";
    return { tasks: text.split(/[\n,;]+|\band\b/).map((s) => s.trim()).filter((s) => s.length > 2).slice(0, 20).map((s) => ({ title: s.charAt(0).toUpperCase() + s.slice(1), area: guess(s), due: /tomorrow/i.test(s) ? day(1) : /today/i.test(s) ? day(0) : "" })) };
  }
  return {
    async json(prompt) {
      await new Promise((r) => setTimeout(r, 700));
      if (/Brain dump:/.test(prompt)) return dump(prompt);
      if (/Return only JSON in this shape: \{"brief"/.test(prompt)) return plan(prompt);
      return {};
    },
  };
}

export const demoPush = {
  supported: false, permission: () => "unsupported", current: async () => null,
  enable: async () => { throw Object.assign(new Error("demo"), { code: "unsupported" }); },
  save: async () => {}, disable: async () => {}, test: async () => {},
  alarmsLink: async () => { throw Object.assign(new Error("demo"), { code: "not_configured" }); }, badge() {},
};

export function demoEnv() {
  const store = demoStore();
  return { demo: true, db: demoDb(store), sample: demoSample(), calendar: async () => ({ events: demoEvents() }), push: demoPush };
}
