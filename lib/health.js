// Health section of Daily Board: Train, Food and Progress, built from lib/health-plan.js.
// Logs go to the health_logs collection: one row per entry, id = <kind letter>-<YYYY-MM-DD>[-key].
/* eslint-disable */
import { GOAL, CHECKPOINTS, WORKOUTS, WEEK, EFFORT, KEY_LIFTS, TARGETS, MEALS, FOOD_RULES, ROUTINE, COACH_URL, formVideo } from "./health-plan";

export function makeHealth(c) {
  var state = c.state, esc = c.esc, G = c.G;
  var SEGS = [["train", "Train"], ["food", "Food"], ["progress", "Progress"]];

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

  /* ---------- pieces ---------- */
  function segBar(seg) {
    return '<div class="seg" role="group" aria-label="Health section">' + SEGS.map(function (s) { return '<button data-act="h-seg" data-seg="' + s[0] + '" aria-pressed="' + (seg === s[0]) + '">' + s[1] + "</button>"; }).join("") + "</div>";
  }
  function bar(pct, label) { pct = Math.max(0, Math.min(100, pct)); return '<div class="hbar" role="img" aria-label="' + esc(label) + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>'; }
  function checkRow(on, act, attrs, aria, title, meta, extra) {
    return '<li class="row' + (on ? " done" : "") + '" style="--c:var(--a-personal)"><button class="check" data-act="' + act + '" ' + attrs + ' aria-label="' + esc(aria) + '"><i></i></button>' +
      '<button class="row-main" data-act="' + act + '-open" ' + attrs + '><span class="row-title">' + title + "</span>" + (meta ? '<span class="row-meta"><span>' + meta + "</span></span>" : "") + "</button>" + (extra || "") + "</li>";
  }

  function pageTrain() {
    var td = c.today(), d = state.hday || td, w = workoutOn(d), p = dayPlan(d), h = "";
    h += '<div class="week" role="group" aria-label="Pick a day">' + weekDays(td).map(function (dd) {
      var x = c.toDate(dd), wo = workoutOn(dd), done = sessionDone(dd);
      return '<button class="day' + (dd === td ? " is-today" : "") + '" data-act="h-day" data-day="' + dd + '" aria-pressed="' + (dd === d) + '" aria-label="' + esc(c.fmtLong(dd) + ", " + (wo ? wo.name : "rest") + (done ? ", done" : "")) + '"><span class="wd">' + esc(x.toLocaleDateString(undefined, { weekday: "short" })) + '</span><span class="dn">' + x.getDate() + '</span><span class="dots">' +
        (wo ? '<i style="--c:' + (done ? "var(--green)" : wo.optional ? "var(--muted)" : "var(--accent)") + '"></i>' : "") + "</span></button>";
    }).join("") + "</div>";
    var when = d === td ? "Today" : d === c.plus(1) ? "Tomorrow" : c.fmt(d);
    if (!w) {
      h += '<section class="hcard"><div class="kicker2">' + esc(when) + '</div><div class="htitle">Rest day</div><div class="meta">' + esc(p.rest) + "</div></section>";
    } else {
      var total = w.exercises.reduce(function (a, e) { return a + e.sets; }, 0), logged = w.exercises.filter(function (e) { return setsOn(d, e.id); }).length, done = sessionDone(d);
      h += '<section class="hcard"><div class="kicker2">' + esc(when) + (w.optional ? " · Optional" : "") + (done ? ' · <span class="ok">Done</span>' : "") + '</div><div class="htitle">' + esc(w.name) + '</div><div class="meta">' + w.exercises.length + " exercises · " + total + " working sets" + (logged ? " · " + logged + " logged" : "") + "</div>" + (p.note ? '<div class="meta">' + esc(p.note) + "</div>" : "") + "</section>";
      h += "<section>" + c.panel(w.exercises.map(function (e, i) {
        var today = setsOn(d, e.id), last = lastSets(e.id, c.plus(-1, d)), bits = [esc(e.scheme)];
        if (e.priority) bits.push('<span class="prio">Priority</span>');
        if (e.note) bits.push(esc(e.note));
        if (today) bits.push("Today " + esc(today.map(setText).filter(Boolean).join(", ")));
        else if (last) bits.push("Last " + esc(setText(topSet(last.data.sets))));
        return checkRow(!!today, "h-ex", 'data-ex="' + e.id + '" data-w="' + p.workout + '" data-day="' + d + '"', (today ? "Edit sets: " : "Log sets: ") + e.name, '<span class="hn">' + (i + 1) + "</span>" + esc(e.name), bits.join(" · "),
          '<a class="mini hvid" href="' + esc(formVideo(e.name)) + '" target="_blank" rel="noopener" aria-label="Form video: ' + esc(e.name) + '">Form</a>');
      })) + "</section>";
      h += '<div class="hacts"><button class="btn' + (done ? " ghost" : "") + '" data-act="h-session" data-day="' + d + '" data-w="' + p.workout + '">' + (done ? "Mark not done" : G.tick + "Finish " + esc(w.name)) + "</button></div>";
      h += '<p class="hnote">' + esc(EFFORT) + "</p>";
    }
    return h;
  }

  function pageFood() {
    var d = c.today(), e = eaten(d), kt = kcalTarget(d), box = boxing(d), h = "";
    h += '<section class="hcard"><div class="hsplit"><div><div class="hbig">' + n0(e.kcal) + '<span> / ' + n0(kt) + ' kcal</span></div>' + bar(e.kcal / kt * 100, n0(e.kcal) + " of " + n0(kt) + " kcal") + '</div><div><div class="hbig">' + n0(e.protein) + '<span> / ' + TARGETS.protein + ' g protein</span></div>' + bar(e.protein / TARGETS.protein * 100, n0(e.protein) + " of " + TARGETS.protein + " g protein") + "</div></div>" +
      '<div class="meta">Left today: <b>' + n0(Math.max(0, kt - e.kcal)) + " kcal</b> and <b>" + n0(Math.max(0, TARGETS.protein - e.protein)) + " g protein</b>. Fat " + esc(TARGETS.fat) + ", carbs " + esc(TARGETS.carbs) + ".</div>" +
      '<div class="pills"><button class="pill' + (box ? " on2" : "") + '" data-act="h-boxing" aria-pressed="' + box + '">' + (box ? G.tick : "") + "Boxing today (+" + TARGETS.boxingKcal + " kcal)</button></div></section>";
    var nm = nextMeal(d);
    h += "<section><h2>Eating schedule</h2>" + c.panel(MEALS.map(function (m) {
      var l = get("m-" + d + "-" + m.id), k = l ? num(l.data.kcal) : m.kcal, pr = l ? num(l.data.protein) : m.protein;
      var meta = '<span class="htime' + (nm && nm.id === m.id ? " next" : "") + '">' + esc(c.hm(c.parseHM(m.time))) + (nm && nm.id === m.id ? " · Next" : "") + "</span> · " + esc(m.food) + " · " + n0(k) + " kcal · " + n0(pr) + " g" + (l && (k !== m.kcal || pr !== m.protein) ? " (adjusted)" : "");
      return checkRow(!!l, "h-meal", 'data-meal="' + m.id + '"', (l ? "Mark not eaten: " : "Mark eaten: ") + m.name, esc(m.name), meta);
    }).concat(mealsOn(d).filter(function (l) { return l.key === "extra"; }).map(function (l) {
      return '<li class="row done" style="--c:var(--a-personal)"><span class="check" aria-hidden="true"><i></i></span><span class="row-main"><span class="row-title">' + esc(l.data.name || "Extra food") + '</span><span class="row-meta">' + n0(num(l.data.kcal) || 0) + " kcal · " + n0(num(l.data.protein) || 0) + ' g</span></span><button class="mini" data-act="h-extra-del" data-id="' + esc(l.id) + '" aria-label="Remove ' + esc(l.data.name || "extra food") + '">Remove</button></li>';
    })), '<form class="hform" id="h-food-form"><input id="hf-name" type="text" placeholder="Something else you ate" aria-label="Food" autocomplete="off"><input id="hf-kcal" type="number" inputmode="numeric" min="0" placeholder="kcal" aria-label="Calories"><input id="hf-pro" type="number" inputmode="numeric" min="0" placeholder="Protein g" aria-label="Protein in grams"><button class="btn" type="submit">Add</button></form>') + "</section>";
    h += '<section><h2>Rules</h2><ul class="hrules">' + FOOD_RULES.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul></section>";
    return h;
  }

  function chart(ws) {
    var W = 340, H = 170, L = 30, R = 8, T = 10, B = 22, x0 = c.toDate(GOAL.start.date).getTime(), x1 = c.toDate(GOAL.date).getTime(), y0 = 166, y1 = 192;
    function X(d) { return L + (c.toDate(d).getTime() - x0) / (x1 - x0) * (W - L - R); }
    function Y(v) { return T + (y1 - Math.max(y0, Math.min(y1, v))) / (y1 - y0) * (H - T - B); }
    var g = "";
    [170, 175, 180, 185, 190].forEach(function (v) { g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" class="gl"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + v + "</text>"; });
    [["2026-11-06", "Nov"], ["2027-02-01", "Feb"], ["2027-05-01", "May"], ["2027-08-01", "Aug"], ["2027-10-24", "Oct"]].forEach(function (m, i, a) { g += '<text x="' + X(m[0]).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? "start" : i === a.length - 1 ? "end" : "middle") + '">' + m[1] + "</text>"; });
    var plan = [[GOAL.start.date, GOAL.start.weight]].concat(CHECKPOINTS.map(function (p) { return [p.date, p.target]; }));
    g += '<polyline class="plan" points="' + plan.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
    plan.slice(1).forEach(function (p) { g += '<circle class="cp" cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="3.5"/>'; });
    var pts = ws.filter(function (l) { return l.day >= GOAL.start.date && l.day <= GOAL.date; }).map(function (l) { return [l.day, avg7(l.day, ws)]; });
    if (pts.length > 1) g += '<polyline class="act" points="' + pts.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
    var last = pts.length ? pts[pts.length - 1] : [GOAL.start.date, GOAL.start.weight];
    g += '<circle class="me" cx="' + X(last[0]).toFixed(1) + '" cy="' + Y(last[1]).toFixed(1) + '" r="5"/>';
    var label = "Planned weight " + plan.map(function (p) { return p[1] + " lb by " + c.fmt(p[0]); }).join(", ") + ". You: " + r1(last[1]) + " lb.";
    return '<svg class="hchart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(label) + '">' + g + "</svg>" +
      '<div class="hlegend"><span><i class="me"></i>You (7-day average)</span><span><i class="plan"></i>Plan and checkpoints</span></div>';
  }

  function pageProgress() {
    var d = c.today(), ws = weights(), a = avg7(d, ws), cur = a != null ? a : (ws.length ? num(ws[ws.length - 1].data.lb) : GOAL.start.weight), cp = nextCheckpoint(d), todayW = get("w-" + d), h = "";
    h += '<section class="hcard"><div class="kicker2">Goal 1 · ' + esc(c.toDate(GOAL.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })) + '</div><div class="htitle">' + esc(GOAL.title) + '</div><div class="meta">' + Math.max(0, daysBetween(d, GOAL.date)) + " days left · " + esc(GOAL.phase) + "</div></section>";
    h += '<section class="hcard"><div class="hsplit"><div><div class="kicker2">Weight</div><div class="hbig">' + r1(cur) + '<span> lb</span></div><div class="meta">' + (a != null ? "7-day average" : ws.length ? "Last weigh-in" : "Starting weight, Nov 6") + '</div></div><div class="hright"><div class="kicker2">Next checkpoint</div><div class="hmid">~' + cp.target + " lb by " + esc(c.fmt(cp.date)) + '</div><div class="meta">' + (cur < cp.target ? r1(cp.target - cur) + " lb to go" : "On track") + "</div></div></div>" + chart(ws) +
      '<form class="hform" id="h-weight-form"><input id="hw" type="number" inputmode="decimal" step="0.1" min="80" max="400" placeholder="Today\'s weight" aria-label="Today\'s weight in pounds" value="' + (todayW ? esc(todayW.data.lb) : "") + '"><span class="unit">lb</span><button class="btn" type="submit">' + (todayW ? "Update" : "Log weight") + "</button></form></section>";
    var wk = weekDays(d), sessions = wk.filter(sessionDone).length, planned = wk.filter(function (x) { var w = workoutOn(x); return w && !w.optional; }).length;
    var foodDays = wk.filter(function (x) { return x <= d && mealsOn(x).length; }).length, past = wk.filter(function (x) { return x <= d; });
    var prot = past.map(function (x) { return eaten(x).protein; }).filter(function (v) { return v > 0; });
    var waist = ofKind("waist").sort(function (x, y) { return x.day < y.day ? 1 : -1; })[0];
    h += '<div class="hgrid">' +
      '<button class="htile" data-act="h-waist"><span class="l">Waist</span><span class="v">' + (waist ? esc(r1(num(waist.data.inches))) + " in" : "Not measured") + '</span><span class="s">' + (waist ? esc(c.fmt(waist.day)) + " · Tap to log" : "At the navel. Tap to log") + "</span></button>" +
      '<div class="htile"><span class="l">Sessions</span><span class="v">' + sessions + " of " + planned + '</span><span class="s">This week</span></div>' +
      '<div class="htile"><span class="l">Food logged</span><span class="v">' + foodDays + " of " + past.length + '</span><span class="s">Days this week</span></div>' +
      '<div class="htile"><span class="l">Protein</span><span class="v">' + (prot.length ? n0(prot.reduce(function (x, y) { return x + y; }, 0) / prot.length) + " g" : "—") + '</span><span class="s">Daily average this week</span></div></div>';
    h += '<section><h2>Key lifts <span class="sp"></span><span class="n">Best top set</span></h2>' + c.panel(KEY_LIFTS.map(function (id) {
      var b = bestEver(id); return '<li class="row hlift"><span class="row-main"><span class="row-title">' + esc(exName(id)) + '</span></span><span class="hval">' + (b ? esc(setText(b)) : "—") + "</span></li>";
    })) + "</section>";
    h += "<section><h2>Checkpoints</h2>" + c.panel(CHECKPOINTS.map(function (p) {
      var act = p.date <= d ? avg7(p.date, ws) : null;
      return '<li class="row hlift"><span class="row-main"><span class="row-title">' + esc(c.fmt(p.date)) + " · ~" + p.target + ' lb</span><span class="row-meta">' + esc(p.note) + '</span></span><span class="hval">' + (act != null ? r1(act) + " lb" : "") + "</span></li>";
    })) + "</section>";
    return h;
  }

  function routineSection() {
    var open = c.entries("tasks").filter(function (t) { return !t.done && t.source === "Health"; });
    var have = ROUTINE.filter(function (r) { return open.some(function (t) { return t.title === r.title; }); }).length;
    return '<section><h2>Daily routine</h2><div class="hcard"><div class="meta">' + ROUTINE.map(function (r) { return esc(c.hm(c.parseHM(r.atTime))) + " " + esc(r.title); }).join(" · ") + "</div>" +
      (have === ROUTINE.length ? '<div class="meta ok">In your Today list every day, with reminders.</div>' : '<div class="pills"><button class="btn" data-act="h-routine">' + (have ? "Add the missing ones" : "Add to Today with reminders") + "</button></div>") + "</div></section>";
  }

  /* ---------- public ---------- */
  function defaultSeg() { var d = c.today(), w = workoutOn(d); return w && !w.optional && !sessionDone(d) ? "train" : "food"; }
  function page() {
    var seg = state.hseg || defaultSeg(), d = c.today(), w = workoutOn(d), e = eaten(d);
    var h = '<div class="hero"><div class="grow"><h1>Health</h1><div class="sub">' + esc(w ? w.name + " today" : "Rest day") + " · " + n0(e.kcal) + " of " + n0(kcalTarget(d)) + ' kcal</div></div><a class="btn ghost" href="' + COACH_URL + '" target="_blank" rel="noopener">Ask your coach</a></div>';
    h += segBar(seg);
    h += seg === "train" ? pageTrain() : seg === "food" ? pageFood() : pageProgress();
    if (seg !== "train" || !state.hday || state.hday === d) h += routineSection();
    return '<div class="single health">' + h + "</div>";
  }
  function todayCard() {
    var d = c.today(), w = workoutOn(d), e = eaten(d), nm = nextMeal(d), done = w && sessionDone(d);
    var line = w ? (done ? w.name + " done" : w.name + " · " + w.exercises.length + " exercises" + (w.optional ? " · optional" : "")) : "Rest day";
    var food = n0(e.kcal) + " of " + n0(kcalTarget(d)) + " kcal · " + n0(e.protein) + " g protein" + (nm ? " · Next: " + nm.name + " " + c.hm(c.parseHM(nm.time)) : "");
    return '<button class="htoday" data-act="go" data-view="health"><span class="ic sq" style="--c:var(--a-personal)">' + G.heart + '</span><span class="grow"><span class="l">Health</span><span class="t">' + esc(line) + '</span><span class="m">' + esc(food) + "</span></span>" + G.chev + "</button>";
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
    if (a === "h-seg") { state.hseg = el.dataset.seg; if (state.hseg === "train") state.hday = ""; c.render(); }
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
      v = num(c.$("hw").value); if (v == null || v < 80 || v > 400) { c.toast("Enter your weight in pounds"); return true; }
      put("w-" + d, d, "weight", "", { lb: v }); c.toast("Logged " + r1(v) + " lb");
    } else if (f.id === "h-waist-form") {
      v = num(c.$("hz").value); c.closeSheet(); if (v == null) return true;
      put("z-" + d, d, "waist", "", { inches: v });
    } else return false;
    return true;
  }

  return { page: page, todayCard: todayCard, act: act, submit: submit };
}
