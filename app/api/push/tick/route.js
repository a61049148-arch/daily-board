// Called every minute by Supabase pg_cron (see supabase/reminders-cron.sql). Sends due reminders and the morning summary.
import { adminDb, cronOk, missing, notConfigured, sendAll, taskPayload } from "@/lib/push-server";
import { runRecap } from "@/lib/recap";
import { addDays, localNow, parseHM, remindKey, remindStamp, stamp } from "@/lib/recur";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const LATE_LIMIT = 30; // minutes: a reminder missed by more than this is skipped instead of sent late

function asTask(r) { return { due: r.due, atTime: r.at_time, remindMin: r.remind_min }; }

async function runUser(userId, subs) {
  const db = adminDb(), tz = subs[0].tz, now = localNow(tz), nowS = stamp(now.ymd, now.mins);
  let sent = 0;

  const { data: timed } = await db.from("tasks").select("*").eq("user_id", userId).eq("done", false).neq("at_time", "")
    .not("remind_min", "is", null).gte("due", addDays(now.ymd, -1)).lte("due", addDays(now.ymd, 1));
  for (const t of timed || []) {
    const at = remindStamp(asTask(t)), key = remindKey(asTask(t));
    if (at == null || at > nowS || nowS - at > LATE_LIMIT || t.reminded_key === key) continue;
    await db.from("tasks").update({ reminded_key: key }).eq("id", t.id);
    sent += await sendAll(subs, taskPayload(t, Number(t.remind_min) || 0));
  }

  const morning = subs.filter((s) => {
    const m = parseHM(s.morning);
    return m != null && s.morning_sent !== now.ymd && now.mins >= m && now.mins - m <= 120;
  });
  if (morning.length) {
    await db.from("push_subs").update({ morning_sent: now.ymd }).in("endpoint", morning.map((s) => s.endpoint));
    const [{ data: open }, { data: people }] = await Promise.all([
      db.from("tasks").select("title,due,at_time,sort_order").eq("user_id", userId).eq("done", false).lte("due", now.ymd).order("sort_order"),
      db.from("people").select("name").eq("user_id", userId).lte("follow_up", now.ymd),
    ]);
    const list = open || [], late = list.filter((t) => t.due < now.ymd).length, fu = (people || []).length;
    const timedToday = list.filter((t) => t.at_time).sort((a, b) => a.at_time.localeCompare(b.at_time));
    const first = timedToday[0] || list[0];
    const bits = [];
    if (first) bits.push("First up: " + first.title + ".");
    if (late) bits.push(late + " carried over from before.");
    if (fu) bits.push(fu + " follow-up" + (fu === 1 ? "" : "s") + " due.");
    const title = list.length ? list.length + " thing" + (list.length === 1 ? "" : "s") + " on today" : "A clear day";
    const body = bits.join(" ") || "Nothing planned yet. Open the board to plan your day.";
    sent += await sendAll(morning, { title, body, tag: "morning-" + now.ymd, url: "/#today", badge: list.length });
  }
  return sent;
}

async function handle(req) {
  if (!cronOk(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (missing().length) return notConfigured();
  const { data: subs, error } = await adminDb().from("push_subs").select("*");
  if (error) return Response.json({ error: "unavailable", message: error.message }, { status: 502 });
  const byUser = new Map();
  for (const s of subs || []) byUser.set(s.user_id, [...(byUser.get(s.user_id) || []), s]);
  let sent = 0;
  for (const [userId, list] of byUser) {
    sent += await runUser(userId, list);
    await runRecap(adminDb(), userId, list[0].tz).catch(() => {});
  }
  return Response.json({ ok: true, sent });
}

export const GET = handle;
export const POST = handle;
