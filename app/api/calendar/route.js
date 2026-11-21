import ical from "node-ical";
import { requireUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const DAY = 864e5;

function ymdUTC(d) { return d.toISOString().slice(0, 10); }

function text(v) { return String(v && typeof v === "object" ? v.val || "" : v || "").trim(); }

function toEvent(ev, start, end, allDay) {
  return {
    summary: ev.summary && typeof ev.summary === "object" ? ev.summary.val : ev.summary || "Busy",
    start: allDay ? { date: ymdUTC(start) } : { dateTime: start.toISOString() },
    end: allDay ? { date: ymdUTC(end) } : { dateTime: end.toISOString() },
    transparency: String(ev.transparency || "").toLowerCase() === "transparent" ? "transparent" : "opaque",
    status: String(ev.status || "").toLowerCase(),
    location: text(ev.location).slice(0, 200),
    description: text(ev.description).slice(0, 1000),
    url: /^https:\/\//.test(text(ev.url)) ? text(ev.url) : "",
  };
}

export async function GET(req) {
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  const url = process.env.GCAL_ICS_URL;
  if (!url) return Response.json({ error: "not_configured" }, { status: 404 });

  let text;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    text = await r.text();
  } catch (_) {
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }

  const data = ical.sync.parseICS(text);
  const from = new Date(Date.now() - 2 * DAY), to = new Date(Date.now() + 10 * DAY);
  const events = [];

  for (const ev of Object.values(data)) {
    if (!ev || ev.type !== "VEVENT" || !ev.start) continue;
    const allDay = ev.datetype === "date";
    const dur = (ev.end ? +ev.end : +ev.start + (allDay ? DAY : 30 * 60e3)) - +ev.start;
    const add = (start, src) => {
      const end = new Date(+start + dur);
      if (end < from || start > to) return;
      const e = toEvent(src || ev, start, end, allDay);
      if (e.status !== "cancelled") events.push(e);
    };
    if (ev.rrule) {
      // Expand repeats inside the window; keep the original time of day.
      const base = new Date(ev.start);
      for (const occ of ev.rrule.between(new Date(+from - DAY), new Date(+to + DAY), true)) {
        const key = ymdUTC(occ);
        if (ev.exdate && Object.values(ev.exdate).some((x) => x && ymdUTC(new Date(x)) === key)) continue;
        if (ev.recurrences && ev.recurrences[key]) {
          const o = ev.recurrences[key];
          if (o.start) add(new Date(o.start), o);
          continue;
        }
        const days = Math.round((Date.UTC(occ.getUTCFullYear(), occ.getUTCMonth(), occ.getUTCDate()) - Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate())) / DAY);
        add(new Date(+base + days * DAY));
      }
    } else {
      add(new Date(ev.start));
    }
  }
  events.sort((a, b) => String(a.start.dateTime || a.start.date).localeCompare(String(b.start.dateTime || b.start.date)));
  return Response.json({ events });
}
