// Health section of Daily Board, styled after the Health HQ app mockup: Today (steps), Train, Food and Progress, built from lib/health-plan.js.
// Logs go to the health_logs collection: one row per entry, id = <kind letter>-<YYYY-MM-DD>[-key]. Kinds: w weight, z waist, s sets, m meal, t session, b boxing, r step (routine items with no other log).
/* eslint-disable */
import { GOAL, CHECKPOINTS, WORKOUTS, WEEK, EFFORT, KEY_LIFTS, TARGETS, MEALS, FOOD_RULES, ROUTINE, COACH_URL, formVideo } from "./health-plan";

export function makeHealth(c) {
  var state = c.state, esc = c.esc, G = c.G;
  var SEGS = [["today", "Today"], ["train", "Train"], ["food", "Food"], ["progress", "Progress"]];

  /* ---------- logs ---------- */
  function logs() { return c.entries("health_logs"); }
  function get(id) { return state.health_logs.get(id) || null; }
  function put(id, day, kind, key, data) { c.save("health_logs", id, { day: day, kind: kind, key: key || "", data: data || {}, created: new Date().toISOString() }); }
  function del(id) { c.remove("health_logs", id); }
  function ofKind(k) { return logs().filter(function (l) { return l.kind === k; }); }
  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) ? n : null; }
  function r1(n) { return Math.round(n * 10) / 10; }
  function n0(n) { return Math.round(n).toLocaleString("en-US"); }

  /* ---------- plan lookups ---------- */
  function dayPlan(d) { return WEEK[c.toDate(d).getDay()]; }
  function workoutOn(d) { var p = dayPlan(d); return p.workout ? WORKOUTS[p.workout] : null; }
  function monday(d) { var x = c.toDate(d), k = (x.getDay() + 6) % 7; return c.plus(-k, d); }
  function weekDays(d) { var m = monday(d), out = []; for (var i = 0; i < 7; i++) out.push(c.plus(i, m)); return out; }
  function sessionDone(d) { return !!get("t-" + d); }
  function setsOn(d, exId) { var l = get("s-" + d + "-" + exId); return l && l.data && l.data.sets ? l.data.sets : null; }
  function lastSets(exId, beforeOrOn) {
    var best = null;
    ofKind("sets").forEach(function (l) { if (l.key === exId && l.day <= beforeOrOn && (!best || l.day > best.day)) best = l; });
    return best;
  }
  function topSet(sets) {
    var t = null;
    (sets || []).forEach(function (s) { if (s.w == null && s.r == null) return; if (!t || (s.w || 0) > (t.w || 0) || ((s.w || 0) === (t.w || 0) && (s.r || 0) > (t.r || 0))) t = s; });
    return t;
  }
  function setText(s) { return s ? (s.w != null ? r1(s.w) + " × " : "") + (s.r != null ? s.r : "") : ""; }
  function bestEver(exId) {
    var t = null;
    ofKind("sets").forEach(function (l) { if (l.key !== exId) return; var s = topSet(l.data.sets); if (s && (!t || (s.w || 0) > (t.w || 0) || ((s.w || 0) === (t.w || 0) && (s.r || 0) > (t.r || 0)))) t = s; });
    return t;
  }
  function exName(id) { for (var k in WORKOUTS) { var e = WORKOUTS[k].exercises.find(function (x) { return x.id === id; }); if (e) return e.name; } return id; }

  /* ---------- food ---------- */
  function boxing(d) { return !!get("b-" + d); }
  function kcalTarget(d) { return TARGETS.kcal + (boxing(d) ? TARGETS.boxingKcal : 0); }
  function mealsOn(d) { return logs().filter(function (l) { return l.kind === "meal" && l.day === d; }); }
  function eaten(d) { var k = 0, p = 0; mealsOn(d).forEach(function (l) { k += num(l.data.kcal) || 0; p += num(l.data.protein) || 0; }); return { kcal: k, protein: p }; }
  function nextMeal(d) { var now = c.nowMins(); return MEALS.find(function (m) { return !get("m-" + d + "-" + m.id) && c.parseHM(m.time) >= now - 60; }) || null; }

  /* ---------- weight ---------- */
  function weights() { return ofKind("weight").filter(function (l) { return num(l.data.lb) != null; }).sort(function (a, b) { return a.day < b.day ? -1 : 1; }); }
  function avg7(d, ws) {
    ws = ws || weights(); var from = c.plus(-6, d), xs = ws.filter(function (l) { return l.day >= from && l.day <= d; }).map(function (l) { return num(l.data.lb); });
    return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null;
  }
  function nextCheckpoint(d) { return CHECKPOINTS.find(function (p) { return p.date >= d; }) || CHECKPOINTS[CHECKPOINTS.length - 1]; }
  function daysBetween(a, b) { return Math.round((c.toDate(b) - c.toDate(a)) / 864e5); }

  /* ---------- steps (the Health HQ "Today" timeline) ---------- */
  var ICON = {
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10"/></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6l-6 6"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/></svg>'
  };
  function stepLog(d, id) { return !!get("r-" + d + "-" + id); }
  function steps(d) {
    var w = workoutOn(d), out = [];
    out.push({ id: "weigh", title: "Weigh in", at: ROUTINE[0].atTime, detail: "Right after waking, before food. Only the 7-day average counts.", done: !!get("w-" + d) || stepLog(d, "weigh"), action: "Log weight", act: "h-weigh" });
    MEALS.forEach(function (m) {
      out.push({ id: "meal-" + m.id, meal: m.id, title: m.id === "breakfast" ? "Breakfast and creatine" : m.id === "dinner" ? "Eat and log dinner" : m.name, at: m.time, detail: m.food.replace(/\.?$/, ".") + " " + n0(m.kcal) + " kcal, " + m.protein + " g protein.", done: !!get("m-" + d + "-" + m.id), action: "Adjust and log", act: "h-meal-open" });
    });
    if (w) out.push({ id: "workout", title: w.name + (w.optional ? " (optional)" : ""), at: "14:30", when: "Afternoon", detail: w.exercises.length + " exercises. " + (dayPlan(d).note || "Finish before the shake so it counts as your post-workout meal."), done: sessionDone(d), action: "Open workout", act: "h-go-train", w: dayPlan(d).workout });
    ROUTINE.slice(4).forEach(function (r) { var id = r.title === "Phone away" ? "phone" : "lights"; out.push({ id: id, title: r.title, at: r.atTime, detail: r.note, done: stepLog(d, id) }); });
    out.sort(function (a, b) { return c.parseHM(a.at) - c.parseHM(b.at); });
    return out;
  }
  function stepsList(d) {
    var list = steps(d), nowIdx = list.findIndex(function (s) { return !s.done; }), done = list.filter(function (s) { return s.done; }).length;
    var h = '<section class="hq-sec" aria-labelledby="hq-steps-h"><div class="hq-sechead"><h2 id="hq-steps-h">Steps</h2><span>' + done + " of " + list.length + ' done</span></div><ol class="hq-steps">';
    list.forEach(function (s, i) {
      var isNow = i === nowIdx, when = isNow ? "Now" : s.when || c.hm(c.parseHM(s.at));
      h += '<li class="hq-step' + (s.done ? " done" : "") + (isNow ? " is-now" : "") + '"><button class="hq-tick" data-act="h-step" data-step="' + s.id + '" aria-pressed="' + s.done + '" aria-label="' + (s.done ? "Mark not done: " : "Mark done: ") + esc(s.title) + '"><span>' + (s.done ? ICON.check : "") + "</span></button>" +
        '<div class="hq-stepbody"><div class="hq-steptop"><span class="t">' + esc(s.title) + '</span><span class="w">' + esc(when) + "</span></div>";
      if (isNow) {
        h += '<p class="hq-stepdetail">' + esc(s.detail) + '</p><div class="hq-stepacts">' +
          (s.act ? '<button class="hq-btn" data-act="' + s.act + '"' + (s.meal ? ' data-meal="' + s.meal + '"' : "") + ">" + esc(s.action) + "</button>" : "") +
          '<button class="hq-btn ghost" data-act="h-step" data-step="' + s.id + '">Mark done</button></div>';
      }
      h += "</div></li>";
    });
    h += "</ol>" + (nowIdx < 0 ? '<p class="hq-note">All done for today. Alarm at 8:30.</p>' : "") + "</section>";
    return h;
  }
  function toggleStep(id) {
    var d = c.today(), s = steps(d).find(function (x) { return x.id === id; }); if (!s) return;
    if (s.meal) { var mid = "m-" + d + "-" + s.meal, m = MEALS.find(function (x) { return x.id === s.meal; }); if (get(mid)) del(mid); else put(mid, d, "meal", m.id, { name: m.name, kcal: m.kcal, protein: m.protein }); return; }
    if (id === "workout") { var t = "t-" + d; if (get(t)) del(t); else put(t, d, "session", s.w, {}); return; }
    if (id === "weigh" && get("w-" + d)) { weightSheet(); return; }
    var rid = "r-" + d + "-" + id; if (get(rid)) del(rid); else put(rid, d, "step", id, {});
  }

  /* ---------- pieces ---------- */
  function segBar(seg) {
    return '<div class="hq-seg" role="group" aria-label="Health section">' + SEGS.map(function (s) { return '<button data-act="h-seg" data-seg="' + s[0] + '" aria-pressed="' + (seg === s[0]) + '">' + s[1] + "</button>"; }).join("") + "</div>";
  }
  function bar(pct, label, cls) { pct = Math.max(0, Math.min(100, pct)); return '<span class="hq-bar' + (cls ? " " + cls : "") + '" role="img" aria-label="' + esc(label) + '"><i style="width:' + pct.toFixed(1) + '%"></i></span>'; }
  function goalCard(d, cur) {
    return '<button class="hq-goal" data-act="h-seg" data-seg="progress"><span class="hq-goal-l"><span class="k">Goal 1 · ' + esc(c.toDate(GOAL.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })) + '</span><span class="t">' + esc(GOAL.title) + '</span></span><span class="hq-goal-r"><span class="n">' + Math.max(0, daysBetween(d, GOAL.date)) + '</span><span class="s">days left</span></span></button>';
  }
  function currentWeight(d, ws) { ws = ws || weights(); var a = avg7(d, ws); return a != null ? a : (ws.length ? num(ws[ws.length - 1].data.lb) : GOAL.start.weight); }

  function pageToday() {
    var d = c.today(), e = eaten(d), kt = kcalTarget(d), wk = weekDays(d), cp = nextCheckpoint(d);
    var sessions = wk.filter(sessionDone).length, planned = wk.filter(function (x) { var w = workoutOn(x); return w && !w.optional; }).length;
    var h = stepsList(d);
    h += '<section class="hq-sec" aria-labelledby="hq-track-h"><h2 id="hq-track-h" class="hq-h2">Tracking</h2>' +
      '<button class="hq-cal" data-act="h-macros" aria-haspopup="dialog"><span class="hq-cal-top"><span><span class="l">Calories</span><span class="v">' + n0(Math.max(0, kt - e.kcal)) + ' to go</span></span><span class="m">Macros' + ICON.chev + "</span></span>" + bar(e.kcal / kt * 100, n0(e.kcal) + " of " + n0(kt) + " kcal") + '<span class="hq-cal-foot"><span>' + n0(e.kcal) + " eaten</span><span>" + n0(kt) + " goal</span></span></button>" +
      '<div class="hq-tiles3">' +
      '<button class="hq-tile" data-act="h-seg" data-seg="progress"><span class="l">Weight</span><span class="v">' + r1(currentWeight(d)) + ' lb</span><span class="s">' + cp.target + " by " + esc(c.fmt(cp.date)) + "</span></button>" +
      '<button class="hq-tile" data-act="h-seg" data-seg="train"><span class="l">Workouts</span><span class="v">' + sessions + " of " + planned + '</span><span class="s">This week</span></button>' +
      '<button class="hq-tile" data-act="h-seg" data-seg="food"><span class="l">Protein</span><span class="v">' + n0(e.protein) + ' g</span><span class="s">of ' + TARGETS.protein + " g today</span></button></div>" +
      goalCard(d) + "</section>";
    h += routineSection();
    return h;
  }

  function pageTrain() {
    var td = c.today(), d = state.hday || td, w = workoutOn(d), p = dayPlan(d), h = "";
    h += '<div class="hq-days" role="group" aria-label="Pick a day">' + weekDays(td).map(function (dd) {
      var x = c.toDate(dd), wo = workoutOn(dd), done = sessionDone(dd);
      return '<button class="hq-day' + (dd === td ? " is-today" : "") + (done ? " done" : "") + '" data-act="h-day" data-day="' + dd + '" aria-pressed="' + (dd === d) + '" aria-label="' + esc(c.fmtLong(dd) + ", " + (wo ? wo.name : "rest") + (done ? ", done" : "") + (dd === td ? ", today" : "")) + '"><span class="wd">' + esc(x.toLocaleDateString(undefined, { weekday: "short" })) + '</span><span class="dn">' + x.getDate() + '</span><span class="hq-dot' + (wo ? (wo.optional ? " is-opt" : "") : " none") + '"></span></button>';
    }).join("") + "</div>";
    var when = d === td ? "Today" : d === c.plus(1) ? "Tomorrow" : c.fmt(d);
    if (!w) {
      h += '<section class="hq-wcard"><div class="hq-whead"><span class="k">' + esc(when) + ' · Rest day</span><span class="t">' + esc(d === td || c.toDate(d).getDay() !== 3 ? "Rest" : "Boxing or rest") + '</span><span class="m">No lifting</span></div><div class="hq-wrest"><span>' + esc(p.rest) + '</span><span class="s">Boxing goes on Wed or Sun, or at least 3 hours away from lifting.</span></div></section>';
    } else {
      var total = w.exercises.reduce(function (a, e) { return a + e.sets; }, 0), logged = w.exercises.filter(function (e) { return setsOn(d, e.id); }).length, done = sessionDone(d);
      h += '<section class="hq-wcard"><div class="hq-whead"><span class="k">' + esc(when) + (w.optional ? " · Optional" : "") + (done ? " · Done" : "") + '</span><span class="t">' + esc(w.name) + '</span><span class="m">' + w.exercises.length + " exercises · " + total + " working sets" + (logged ? " · " + logged + " logged" : "") + "</span></div>" + (p.note ? '<p class="hq-wnote">' + esc(p.note) + "</p>" : "") + '<ol class="hq-ex">' +
        w.exercises.map(function (e, i) {
          var today = setsOn(d, e.id), last = lastSets(e.id, c.plus(-1, d)), show = today ? today.map(setText).filter(Boolean).join(", ") : last ? setText(topSet(last.data.sets)) : "";
          return '<li class="' + (today ? "done" : "") + '"><button class="hq-exn" data-act="h-ex" data-ex="' + e.id + '" data-w="' + p.workout + '" data-day="' + d + '" aria-label="' + (today ? "Edit sets: " : "Log sets: ") + esc(e.name) + '">' + (today ? ICON.check : i + 1) + '</button><button class="hq-exmain" data-act="h-ex-open" data-ex="' + e.id + '" data-w="' + p.workout + '" data-day="' + d + '"><span class="t">' + esc(e.name) + '</span><span class="s">' + esc(e.scheme) + (e.priority ? '<span class="hq-badge">Priority</span>' : "") + "</span>" + (e.note ? '<span class="s2">' + esc(e.note) + "</span>" : "") + '</button><span class="hq-exr"><span class="l">' + (today ? "Today" : "Last") + '</span><span class="v">' + (show ? esc(show) : "—") + '</span><a href="' + esc(formVideo(e.name)) + '" target="_blank" rel="noopener" aria-label="Form video: ' + esc(e.name) + '">Form</a></span></li>';
        }).join("") + "</ol>" +
        '<div class="hq-wfoot"><button class="hq-btn big' + (done ? " ghost" : "") + '" data-act="h-session" data-day="' + d + '" data-w="' + p.workout + '">' + (done ? "Mark not done" : "Finish " + esc(w.name)) + '</button><p class="hq-note">' + esc(EFFORT) + "</p></div></section>";
    }
    h += coachLink("Ask your coach", "about form, swaps or a stall");
    return h;
  }
  function coachLink(b, rest) { return '<a class="hq-coach" href="' + COACH_URL + '" target="_blank" rel="noopener"><span class="av" aria-hidden="true">HQ</span><span class="tx"><b>' + esc(b) + "</b> " + esc(rest) + "</span>" + ICON.chev + "</a>"; }

  function ring(kcal, kt) {
    var r = 52, circ = 2 * Math.PI * r, len = Math.max(0.001, circ * Math.min(1, kcal / kt));
    return '<div class="hq-ring"><svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" stroke-dasharray="' + len.toFixed(1) + " " + circ.toFixed(1) + '" transform="rotate(-90 60 60)"/></svg><div class="c"><span class="v">' + n0(kcal) + '</span><span class="s">of ' + n0(kt) + " kcal</span></div></div>";
  }
  function pageFood() {
    var d = c.today(), e = eaten(d), kt = kcalTarget(d), box = boxing(d), nm = nextMeal(d), h = "";
    h += '<section class="hq-totals" aria-label="Today\'s totals">' + ring(e.kcal, kt) + '<div class="hq-macros"><div><div class="hq-mr"><b>Protein</b><span>' + n0(e.protein) + " / " + TARGETS.protein + " g</span></div>" + bar(e.protein / TARGETS.protein * 100, n0(e.protein) + " of " + TARGETS.protein + " g protein", "ink") + '</div><div class="hq-mr m"><span>Fat target</span><span>' + esc(TARGETS.fat) + '</span></div><div class="hq-mr m"><span>Carbs</span><span>' + esc(TARGETS.carbs.replace("about ", "")) + "</span></div></div></section>";
    h += '<p class="hq-left">Left today: <b>' + n0(Math.max(0, kt - e.kcal)) + " kcal</b> and <b>" + n0(Math.max(0, TARGETS.protein - e.protein)) + ' g protein</b></p>';
    h += '<button class="hq-toggle" data-act="h-boxing" aria-pressed="' + box + '"><span class="tx"><b>Boxing today</b><span>Adds ' + TARGETS.boxingKcal + ' kcal, mostly carbs</span></span><span class="sw" aria-hidden="true"><i></i></span></button>';
    h += '<section class="hq-sec"><h2 class="hq-label">Meals</h2><ul class="hq-meals">' + MEALS.map(function (m) {
      var l = get("m-" + d + "-" + m.id), k = l ? num(l.data.kcal) : m.kcal, pr = l ? num(l.data.protein) : m.protein, isNext = nm && nm.id === m.id;
      return '<li class="' + (l ? "done" : "") + '"><button class="hq-mealmain" data-act="h-meal-open" data-meal="' + m.id + '"><span class="t">' + esc(m.name) + '<span class="time' + (isNext ? " next" : "") + '">' + esc(c.hm(c.parseHM(m.time))) + (isNext ? " · Next" : "") + '</span></span><span class="s">' + esc(m.food) + '</span><span class="k">' + n0(k) + " kcal · " + n0(pr) + " g protein" + (l && (k !== m.kcal || pr !== m.protein) ? " (adjusted)" : "") + '</span></button><button class="hq-pill' + (l ? " on" : "") + '" data-act="h-meal" data-meal="' + m.id + '" aria-pressed="' + !!l + '" aria-label="' + (l ? "Mark not eaten: " : "Log: ") + esc(m.name) + '">' + (l ? "Logged" : "Log it") + "</button></li>";
    }).concat(mealsOn(d).filter(function (l) { return l.key === "extra"; }).map(function (l) {
      return '<li class="done"><span class="hq-mealmain"><span class="t">' + esc(l.data.name || "Extra food") + '</span><span class="k">' + n0(num(l.data.kcal) || 0) + " kcal · " + n0(num(l.data.protein) || 0) + ' g protein</span></span><button class="hq-pill" data-act="h-extra-del" data-id="' + esc(l.id) + '" aria-label="Remove ' + esc(l.data.name || "extra food") + '">Remove</button></li>';
    })).join("") + "</ul>" +
      '<form class="hq-form" id="h-food-form"><input id="hf-name" type="text" placeholder="Something else you ate" aria-label="Food" autocomplete="off"><input id="hf-kcal" type="number" inputmode="numeric" min="0" placeholder="kcal" aria-label="Calories"><input id="hf-pro" type="number" inputmode="numeric" min="0" placeholder="Protein g" aria-label="Protein in grams"><button class="hq-btn" type="submit">Add</button></form></section>';
    h += '<div class="hq-banner">' + ICON.info + '<ul>' + FOOD_RULES.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul></div>";
    h += coachLink("Ask your coach", "what to eat next");
    return h;
  }

  function chart(ws) {
    var W = 340, H = 168, L = 30, R = 8, T = 10, B = 24, x0 = c.toDate(GOAL.start.date).getTime(), x1 = c.toDate(GOAL.date).getTime(), y0 = 166, y1 = 192;
    function X(d) { return L + (c.toDate(d).getTime() - x0) / (x1 - x0) * (W - L - R); }
    function Y(v) { return T + (y1 - Math.max(y0, Math.min(y1, v))) / (y1 - y0) * (H - T - B); }
    var g = "", cut = CHECKPOINTS[CHECKPOINTS.length - 2];
    g += '<rect class="cut" x="' + X(cut.date).toFixed(1) + '" y="' + T + '" width="' + (W - R - X(cut.date)).toFixed(1) + '" height="' + (H - T - B) + '"/><text class="cutl" x="' + ((X(cut.date) + W - R) / 2).toFixed(1) + '" y="' + (T + 14) + '" text-anchor="middle">CUT</text>';
    [170, 175, 180, 185, 190].forEach(function (v) { g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" class="gl"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + v + "</text>"; });
    [["2026-11-06", "Nov"], ["2027-02-01", "Feb"], ["2027-05-01", "May"], ["2027-08-01", "Aug"], ["2027-10-24", "Oct"]].forEach(function (m, i, a) { g += '<text x="' + X(m[0]).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? "start" : i === a.length - 1 ? "end" : "middle") + '">' + m[1] + "</text>"; });
    var plan = [[GOAL.start.date, GOAL.start.weight]].concat(CHECKPOINTS.map(function (p) { return [p.date, p.target]; }));
    g += '<polyline class="plan" points="' + plan.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
    plan.slice(1).forEach(function (p, i, a) { g += '<circle class="' + (i === a.length - 1 ? "goal" : "cp") + '" cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="' + (i === a.length - 1 ? 5 : 4) + '"/>'; });
    var pts = ws.filter(function (l) { return l.day >= GOAL.start.date && l.day <= GOAL.date; }).map(function (l) { return [l.day, avg7(l.day, ws)]; });
    if (pts.length > 1) g += '<polyline class="act" points="' + pts.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
    var last = pts.length ? pts[pts.length - 1] : [GOAL.start.date, GOAL.start.weight];
    g += '<circle class="me" cx="' + X(last[0]).toFixed(1) + '" cy="' + Y(last[1]).toFixed(1) + '" r="6"/>';
    var label = "Planned weight " + plan.map(function (p) { return p[1] + " lb by " + c.fmt(p[0]); }).join(", ") + ". You: " + r1(last[1]) + " lb.";
    return '<svg class="hq-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(label) + '">' + g + "</svg>" +
      '<div class="hq-legend"><span><i class="me"></i>You (7-day average)</span><span><i class="plan"></i>Plan and checkpoints</span></div>';
  }

  function pageProgress() {
    var d = c.today(), ws = weights(), a = avg7(d, ws), cur = currentWeight(d, ws), cp = nextCheckpoint(d), todayW = get("w-" + d), h = "";
    h += '<section class="hq-hero"><div class="top"><span class="k">Goal 1 · ' + esc(c.toDate(GOAL.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })) + '</span><span class="t">' + esc(GOAL.title) + '</span></div><div class="grid"><div><b>' + r1(cur) + ' lb</b><span>Where you are now</span></div><div><b>' + Math.max(0, daysBetween(d, GOAL.date)) + " days</b><span>" + esc(GOAL.phase) + "</span></div></div></section>";
    h += '<section class="hq-box"><div class="hq-boxhead"><div><span class="hq-label">Weight</span><span class="big">' + r1(cur) + ' lb</span><span class="s">' + (a != null ? "7-day average" : ws.length ? "Last weigh-in" : "Starting weight, " + esc(c.fmt(GOAL.start.date))) + '</span></div><div class="r"><span class="s">Next checkpoint</span><span class="mid">~' + cp.target + " lb by " + esc(c.fmt(cp.date)) + '</span><span class="s">' + (cur < cp.target ? r1(cp.target - cur) + " lb to go" : "On track") + "</span></div></div>" + chart(ws) +
      '<form class="hq-form" id="h-weight-form"><input id="hw" type="number" inputmode="decimal" step="0.1" min="80" max="400" placeholder="Today\'s weight" aria-label="Today\'s weight in pounds" value="' + (todayW ? esc(todayW.data.lb) : "") + '"><span class="unit">lb</span><button class="hq-btn" type="submit">' + (todayW ? "Update" : "Log weight") + "</button></form></section>";
    var wk = weekDays(d), sessions = wk.filter(sessionDone).length, planned = wk.filter(function (x) { var w = workoutOn(x); return w && !w.optional; }).length;
    var foodDays = wk.filter(function (x) { return x <= d && mealsOn(x).length; }).length, past = wk.filter(function (x) { return x <= d; });
    var prot = past.map(function (x) { return eaten(x).protein; }).filter(function (v) { return v > 0; });
    var waist = ofKind("waist").sort(function (x, y) { return x.day < y.day ? 1 : -1; })[0];
    h += '<div class="hq-tiles">' +
      '<button class="hq-tile sunk" data-act="h-waist"><span class="l">Waist</span><span class="v">' + (waist ? esc(r1(num(waist.data.inches))) + " in" : "Not measured") + '</span><span class="s">' + (waist ? esc(c.fmt(waist.day)) + " · Tap to log" : "At the navel. Tap to log") + "</span></button>" +
      '<div class="hq-tile sunk"><span class="l">Sessions</span><span class="v">' + sessions + " of " + planned + '</span><span class="s">This week</span></div>' +
      '<div class="hq-tile sunk"><span class="l">Food logged</span><span class="v">' + foodDays + " of " + past.length + '</span><span class="s">Days this week</span></div>' +
      '<div class="hq-tile sunk"><span class="l">Protein</span><span class="v">' + (prot.length ? n0(prot.reduce(function (x, y) { return x + y; }, 0) / prot.length) + " g" : "—") + '</span><span class="s">Daily average this week</span></div></div>';
    h += '<section class="hq-sec"><div class="hq-sechead"><h2 class="hq-label">Key lifts</h2><span>Best top set</span></div><ul class="hq-lines">' + KEY_LIFTS.map(function (id) {
      var b = bestEver(id); return '<li><span>' + esc(exName(id)) + "</span><b>" + (b ? esc(setText(b)) : "—") + "</b></li>";
    }).join("") + "</ul></section>";
    h += '<section class="hq-sec"><h2 class="hq-label">Checkpoints</h2><ul class="hq-lines">' + CHECKPOINTS.map(function (p) {
      var act = p.date <= d ? avg7(p.date, ws) : null;
      return '<li class="two"><span><span class="t">' + esc(c.fmt(p.date)) + " · ~" + p.target + ' lb</span><span class="s">' + esc(p.note) + "</span></span><b>" + (act != null ? r1(act) + " lb" : "") + "</b></li>";
    }).join("") + "</ul></section>";
    return h;
  }

  function routineSection() {
    var open = c.entries("tasks").filter(function (t) { return !t.done && t.source === "Health"; });
    var have = ROUTINE.filter(function (r) { return open.some(function (t) { return t.title === r.title; }); }).length;
    if (have === ROUTINE.length) return '<p class="hq-note">Your daily routine is in Today with reminders.</p>';
    return '<section class="hq-sec"><h2 class="hq-h2">Reminders</h2><button class="hq-row" data-act="h-routine"><span class="tx"><b>' + (have ? "Add the missing routine reminders" : "Add the routine to Today with reminders") + '</b><span>' + ROUTINE.map(function (r) { return esc(c.hm(c.parseHM(r.atTime))) + " " + esc(r.title); }).join(" · ") + "</span></span>" + ICON.chev + "</button></section>";
  }

  /* ---------- public ---------- */
  function defaultSeg() { return "today"; }
  function page() {
    var seg = state.hseg || defaultSeg(), d = c.today();
    var h = '<header class="hq-head"><div><span class="date">' + esc(c.toDate(d).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })) + '</span><h1>' + (seg === "today" ? "Health" : esc(SEGS.find(function (s) { return s[0] === seg; })[1])) + '</h1></div><a class="hq-coachbtn" href="' + COACH_URL + '" target="_blank" rel="noopener">Ask coach</a></header>';
    h += segBar(seg);
    h += seg === "train" ? pageTrain() : seg === "food" ? pageFood() : seg === "progress" ? pageProgress() : pageToday();
    return '<div class="single health hq">' + h + "</div>";
  }
  function todayCard() {
    var d = c.today(), w = workoutOn(d), e = eaten(d), nm = nextMeal(d), done = w && sessionDone(d);
    var line = w ? (done ? w.name + " done" : w.name + " · " + w.exercises.length + " exercises" + (w.optional ? " · optional" : "")) : "Rest day";
    var food = n0(e.kcal) + " of " + n0(kcalTarget(d)) + " kcal · " + n0(e.protein) + " g protein" + (nm ? " · Next: " + nm.name + " " + c.hm(c.parseHM(nm.time)) : "");
    return '<button class="htoday" data-act="go" data-view="health"><span class="ic sq" style="--c:var(--a-personal)">' + G.heart + '</span><span class="grow"><span class="l">Health</span><span class="t">' + esc(line) + '</span><span class="m">' + esc(food) + "</span></span>" + G.chev + "</button>";
  }

  function macrosSheet() {
    var d = c.today(), e = eaten(d), kt = kcalTarget(d), box = boxing(d);
    var list = mealsOn(d).map(function (l) { return l.data.name || "Food"; });
    c.openSheet('<div class="hq-sheet"><h3>Today\'s macros</h3><div class="hq-sheetbig"><b>' + n0(Math.max(0, kt - e.kcal)) + ' kcal to go</b><span>' + n0(e.kcal) + " of " + n0(kt) + " eaten</span></div>" +
      '<div class="hq-mrow"><div class="hq-mr"><b>Calories</b><span>' + n0(e.kcal) + " <em>/ " + n0(kt) + "</em></span></div>" + bar(e.kcal / kt * 100, "Calories") + "</div>" +
      '<div class="hq-mrow"><div class="hq-mr"><b>Protein</b><span>' + n0(e.protein) + " g <em>/ " + TARGETS.protein + " g</em></span></div>" + bar(e.protein / TARGETS.protein * 100, "Protein", "ink") + '<span class="s">' + n0(Math.max(0, TARGETS.protein - e.protein)) + " g left</span></div>" +
      '<p class="hq-note">Fat ' + esc(TARGETS.fat) + ", carbs " + esc(TARGETS.carbs) + ". " + (list.length ? "So far: " + esc(list.join(", ")) + ". " : "Nothing logged yet. ") + (box ? "Boxing today, so the goal includes " + TARGETS.boxingKcal + " extra kcal." : "Boxing days add " + TARGETS.boxingKcal + " kcal, mostly carbs.") + '</p>' +
      '<div class="foot"><span class="sp"></span><button type="button" class="btn ghost" data-act="close">Close</button><button type="button" class="btn" data-act="h-seg" data-seg="food">Open food</button></div></div>');
  }
  function weightSheet() {
    var d = c.today(), l = get("w-" + d);
    c.openSheet('<form id="h-weight-form"><h3>Weigh in</h3><p class="lead">Right after waking, before food. Only the 7-day average counts.</p><div class="field"><label for="hw2">Weight (lb)</label><input id="hw2" type="number" inputmode="decimal" step="0.1" min="80" max="400" value="' + (l ? esc(l.data.lb) : "") + '"></div><div class="foot"><span class="sp"></span><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn" type="submit">Save</button></div></form>');
    setTimeout(function () { var i = c.$("hw2"); if (i) i.focus(); }, 60);
  }

  function setsSheet(exId, wId, d) {
    var w = WORKOUTS[wId], e = w && w.exercises.find(function (x) { return x.id === exId; }); if (!e) return;
    var cur = setsOn(d, exId), last = lastSets(exId, c.plus(-1, d)), n = Math.max(e.sets, cur ? cur.length : 0), rows = "";
    for (var i = 0; i < n; i++) {
      var s = cur && cur[i], ls = last && last.data.sets[i];
      rows += '<div class="hset"><span class="hn">' + (i + 1) + '</span><input type="number" inputmode="decimal" step="0.5" min="0" data-hw="' + i + '" placeholder="' + (ls && ls.w != null ? esc(ls.w) : "lb") + '" value="' + (s && s.w != null ? esc(s.w) : "") + '" aria-label="Set ' + (i + 1) + ' weight in pounds"><span class="x">×</span><input type="number" inputmode="numeric" min="0" data-hr="' + i + '" placeholder="' + (ls && ls.r != null ? esc(ls.r) : "reps") + '" value="' + (s && s.r != null ? esc(s.r) : "") + '" aria-label="Set ' + (i + 1) + ' reps"></div>';
    }
    c.openSheet('<form id="h-sets-form" data-ex="' + exId + '" data-day="' + d + '" data-n="' + n + '"><h3>' + esc(e.name) + '</h3><p class="lead">' + esc(e.scheme) + (e.note ? " · " + esc(e.note) : "") + (last ? " · Last time (" + esc(c.fmt(last.day)) + "): " + esc(last.data.sets.map(setText).filter(Boolean).join(", ")) : "") + "</p>" +
      '<a class="hvidlink" href="' + esc(formVideo(e.name)) + '" target="_blank" rel="noopener">Watch a form video</a>' +
      '<div class="hsets"><div class="hset head"><span></span><span>Weight (lb)</span><span class="x"></span><span>Reps</span></div>' + rows + "</div>" +
      '<p class="hnote">Gray numbers are last time. Beat them by one rep, or add weight once every set hits the top of the range.</p>' +
      '<div class="foot">' + (cur ? '<button type="button" class="btn danger" data-act="h-sets-clear" data-ex="' + exId + '" data-day="' + d + '">Clear</button>' : "") + '<span class="sp"></span><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn" type="submit">Save</button></div></form>');
  }
  function mealSheet(mealId) {
    var d = c.today(), m = MEALS.find(function (x) { return x.id === mealId; }); if (!m) return;
    var l = get("m-" + d + "-" + m.id);
    c.openSheet('<form id="h-meal-form" data-meal="' + m.id + '"><h3>' + esc(m.name) + '</h3><p class="lead">' + esc(c.hm(c.parseHM(m.time))) + " · " + esc(m.food) + "</p>" +
      '<div class="two"><div class="field"><label for="hm-k">Calories</label><input id="hm-k" type="number" inputmode="numeric" min="0" value="' + esc(l ? l.data.kcal : m.kcal) + '"></div><div class="field"><label for="hm-p">Protein (g)</label><input id="hm-p" type="number" inputmode="numeric" min="0" value="' + esc(l ? l.data.protein : m.protein) + '"></div></div>' +
      '<p class="hnote">Ate something different? Change the numbers, then save.</p><div class="foot">' + (l ? '<button type="button" class="btn danger" data-act="h-meal" data-meal="' + m.id + '">Not eaten</button>' : "") + '<span class="sp"></span><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn" type="submit">' + (l ? "Save" : "Mark eaten") + "</button></div></form>");
  }
  function waistSheet() {
    var d = c.today(), l = get("z-" + d);
    c.openSheet('<form id="h-waist-form"><h3>Waist</h3><p class="lead">Measure at the navel, relaxed, first thing in the morning. Growing faster than about 1 inch per 8–10 lb gained means you are gaining too fast.</p><div class="field"><label for="hz">Inches</label><input id="hz" type="number" inputmode="decimal" step="0.1" min="15" max="70" value="' + (l ? esc(l.data.inches) : "") + '"></div><div class="foot"><span class="sp"></span><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn" type="submit">Save</button></div></form>');
  }

  function addRoutine() {
    var open = c.entries("tasks").filter(function (t) { return !t.done && t.source === "Health"; }), n = 0, base = Date.now();
    ROUTINE.forEach(function (r, i) {
      if (open.some(function (t) { return t.title === r.title; })) return;
      c.save("tasks", c.newId(), { title: r.title, area: "personal", due: c.today(), done: false, doneOn: "", order: base + i, person: "", note: r.note, source: "Health", created: new Date().toISOString(), atTime: r.atTime, remindMin: 0, repeat: "daily", alarm: false }, true);
      n++;
    });
    c.render(); c.toast(n ? "Added " + n + " daily routine tasks" : "Your routine is already in Today");
  }

  function act(a, el) {
    var d = el.dataset.day || c.today(), id;
    if (a === "h-seg") { if (el.closest(".sheet")) c.closeSheet(); state.hseg = el.dataset.seg; if (state.hseg === "train") state.hday = ""; c.render(); window.scrollTo(0, 0); }
    else if (a === "h-step") toggleStep(el.dataset.step);
    else if (a === "h-go-train") { state.hseg = "train"; state.hday = ""; c.render(); window.scrollTo(0, 0); }
    else if (a === "h-weigh") weightSheet();
    else if (a === "h-macros") macrosSheet();
    else if (a === "h-day") { state.hday = el.dataset.day === c.today() ? "" : el.dataset.day; c.render(); }
    else if (a === "h-ex" || a === "h-ex-open") setsSheet(el.dataset.ex, el.dataset.w, d);
    else if (a === "h-sets-clear") { c.closeSheet(); del("s-" + d + "-" + el.dataset.ex); }
    else if (a === "h-session") { id = "t-" + d; if (get(id)) del(id); else { put(id, d, "session", el.dataset.w, {}); c.toast(WORKOUTS[el.dataset.w].name + " done. Eat and log the shake."); } }
    else if (a === "h-meal") {
      d = c.today(); id = "m-" + d + "-" + el.dataset.meal; var m = MEALS.find(function (x) { return x.id === el.dataset.meal; });
      if (el.closest(".sheet")) c.closeSheet();
      if (get(id)) del(id); else if (m) put(id, d, "meal", m.id, { name: m.name, kcal: m.kcal, protein: m.protein });
    }
    else if (a === "h-meal-open") mealSheet(el.dataset.meal);
    else if (a === "h-extra-del") del(el.dataset.id);
    else if (a === "h-boxing") { id = "b-" + c.today(); if (get(id)) del(id); else put(id, c.today(), "boxing", "", {}); }
    else if (a === "h-waist") waistSheet();
    else if (a === "h-routine") addRoutine();
    else return false;
    return true;
  }

  function submit(f) {
    var d = c.today(), v;
    if (f.id === "h-sets-form") {
      var n = +f.dataset.n, sets = [];
      for (var i = 0; i < n; i++) { var w = num(f.querySelector('[data-hw="' + i + '"]').value), r = num(f.querySelector('[data-hr="' + i + '"]').value); if (w != null || r != null) sets.push({ w: w, r: r == null ? null : Math.round(r) }); }
      var k = "s-" + f.dataset.day + "-" + f.dataset.ex; c.closeSheet();
      if (sets.length) put(k, f.dataset.day, "sets", f.dataset.ex, { sets: sets }); else if (get(k)) del(k);
    } else if (f.id === "h-meal-form") {
      var m = MEALS.find(function (x) { return x.id === f.dataset.meal; }); c.closeSheet();
      put("m-" + d + "-" + m.id, d, "meal", m.id, { name: m.name, kcal: num(c.$("hm-k").value) || 0, protein: num(c.$("hm-p").value) || 0 });
    } else if (f.id === "h-food-form") {
      var nm = c.$("hf-name").value.trim(), kc = num(c.$("hf-kcal").value), pr = num(c.$("hf-pro").value);
      if (!nm && kc == null && pr == null) return true;
      put("m-" + d + "-x" + c.newId(), d, "meal", "extra", { name: nm || "Extra food", kcal: kc || 0, protein: pr || 0 });
    } else if (f.id === "h-weight-form") {
      v = num(f.querySelector("input").value); if (v == null || v < 80 || v > 400) { c.toast("Enter your weight in pounds"); return true; }
      if (f.closest(".sheet")) c.closeSheet();
      put("w-" + d, d, "weight", "", { lb: v }); c.toast("Logged " + r1(v) + " lb");
    } else if (f.id === "h-waist-form") {
      v = num(c.$("hz").value); c.closeSheet(); if (v == null) return true;
      put("z-" + d, d, "waist", "", { inches: v });
    } else return false;
    return true;
  }

  // Meals as timed items for the Today agenda.
  function agenda(d) {
    return MEALS.map(function (m) { return { s: c.parseHM(m.time), title: m.name, sub: m.food.split(/\.\s/)[0], meal: m.id, done: !!get("m-" + d + "-" + m.id) }; });
  }

  return { page: page, todayCard: todayCard, agenda: agenda, act: act, submit: submit };
}
