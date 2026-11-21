// Date helpers shared by the board (browser) and the reminder routes (server). No dependencies.

export const REPEATS = [
  ["", "Never"],
  ["daily", "Every day"],
  ["weekdays", "Weekdays"],
  ["weekly", "Every week"],
  ["monthly", "Every month"],
];

function pad(n) { return String(n).padStart(2, "0"); }
function parts(s) { const p = String(s).split("-").map(Number); return { y: p[0], m: p[1], d: p[2] }; }
function utc(s) { const p = parts(s); return Date.UTC(p.y, p.m - 1, p.d); }
function fromUtc(ms) { const d = new Date(ms); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
export function addDays(s, n) { return fromUtc(utc(s) + n * 864e5); }

// Next due date for a repeating task, always after `after` (usually today) so a late finish doesn't pile up.
export function nextDue(due, repeat, after) {
  if (!repeat) return "";
  let d = due || after;
  const step = () => {
    if (repeat === "daily") d = addDays(d, 1);
    else if (repeat === "weekly") d = addDays(d, 7);
    else if (repeat === "weekdays") { do { d = addDays(d, 1); } while ([0, 6].includes(new Date(utc(d)).getUTCDay())); }
    else if (repeat === "monthly") {
      const p = parts(d), day = p.d;
      const y = p.m === 12 ? p.y + 1 : p.y, m = p.m === 12 ? 1 : p.m + 1;
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      d = y + "-" + pad(m) + "-" + pad(Math.min(day, last));
    } else d = addDays(d, 1);
  };
  step();
  for (let i = 0; i < 800 && d <= after; i++) step();
  return d;
}

export function parseHM(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  const v = +m[1] * 60 + +m[2];
  return v >= 0 && v < 1440 ? v : null;
}
export function fmtHM(mins) {
  const h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? "PM" : "AM";
  return (h % 12 || 12) + (m ? ":" + pad(m) : "") + " " + ap;
}

// Local date and minutes-after-midnight of an instant in a time zone.
export function localNow(tz, at) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz || "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const o = {};
  for (const p of f.formatToParts(at || new Date())) o[p.type] = p.value;
  return { ymd: o.year + "-" + o.month + "-" + o.day, mins: (+o.hour % 24) * 60 + +o.minute };
}

// Minutes on a single local timeline, so "due + time - lead" can be compared with "now" without time zone math.
export function stamp(ymd, mins) { return utc(ymd) / 60000 + mins; }

// When a task's reminder fires, on the same local timeline as stamp(). null when it has none.
export function remindStamp(t) {
  const at = parseHM(t.atTime);
  if (!t.due || at == null || t.remindMin == null || t.remindMin === "") return null;
  return stamp(t.due, at) - Number(t.remindMin || 0);
}
export function remindKey(t) { return [t.due, t.atTime, t.remindMin].join("|"); }
