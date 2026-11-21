// Done or Snooze tapped on a notification. The service worker has no sign-in, so the notification carries a signed task id.
import { adminDb, checkSig, completeTask, missing, notConfigured, userTz } from "@/lib/push-server";
import { localNow } from "@/lib/recur";

export const dynamic = "force-dynamic";

function pad(n) { return String(n).padStart(2, "0"); }

export async function POST(req) {
  if (missing().length) return notConfigured();
  let body;
  try { body = await req.json(); } catch (_) { return Response.json({ error: "bad_request" }, { status: 400 }); }
  const id = String(body.taskId || "");
  if (!id || !checkSig("task:" + id, body.sig)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const db = adminDb();
  const { data: t } = await db.from("tasks").select("*").eq("id", id).maybeSingle();
  if (!t) return Response.json({ error: "not_found" }, { status: 404 });
  const tz = await userTz(t.user_id);
  if (body.act === "done") {
    if (!t.done) await completeTask(t, tz);
  } else if (body.act === "snooze") {
    const now = localNow(tz), m = Math.min(now.mins + 60, 23 * 60 + 59);
    await db.from("tasks").update({ due: now.ymd, at_time: pad(Math.floor(m / 60)) + ":" + pad(m % 60), remind_min: 0 }).eq("id", id);
  } else return Response.json({ error: "bad_request" }, { status: 400 });
  return Response.json({ ok: true });
}
