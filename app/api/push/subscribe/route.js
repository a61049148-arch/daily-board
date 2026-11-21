import { requireUser } from "@/lib/server-auth";
import { adminDb, missing, notConfigured } from "@/lib/push-server";
import { parseHM } from "@/lib/recur";

export const dynamic = "force-dynamic";

// GET: the public key the phone needs to subscribe. POST: save this device. DELETE: forget it.
export async function GET(req) {
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  if (missing().length) return notConfigured();
  const { data } = await adminDb().from("push_subs").select("endpoint,morning,tz").eq("user_id", user.id);
  return Response.json({ publicKey: process.env.VAPID_PUBLIC_KEY, devices: (data || []).length, morning: data && data[0] ? data[0].morning : "08:00" });
}

export async function POST(req) {
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  if (missing().length) return notConfigured();
  let body;
  try { body = await req.json(); } catch (_) { return Response.json({ error: "bad_request" }, { status: 400 }); }
  const sub = body && body.sub;
  if (!sub || typeof sub.endpoint !== "string" || !/^https:\/\//.test(sub.endpoint) || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  let tz = String(body.tz || "America/Los_Angeles");
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch (_) { tz = "America/Los_Angeles"; }
  const row = { endpoint: sub.endpoint, user_id: user.id, p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth), tz };
  if (body.morning !== undefined) row.morning = body.morning === "" || parseHM(body.morning) != null ? String(body.morning) : "08:00";
  const db = adminDb();
  // A device belongs to one account; don't let another account take over an endpoint.
  const { data: existing } = await db.from("push_subs").select("user_id").eq("endpoint", sub.endpoint).maybeSingle();
  if (existing && existing.user_id !== user.id) return Response.json({ error: "forbidden" }, { status: 403 });
  const { error } = await db.from("push_subs").upsert(row, { onConflict: "endpoint" });
  if (error) return Response.json({ error: "unavailable", message: error.message }, { status: 502 });
  // Keep the morning time the same on all of this person's devices.
  if (row.morning !== undefined) await db.from("push_subs").update({ morning: row.morning }).eq("user_id", user.id);
  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  if (missing().length) return notConfigured();
  let body = {};
  try { body = await req.json(); } catch (_) {}
  if (body.endpoint) await adminDb().from("push_subs").delete().eq("endpoint", String(body.endpoint)).eq("user_id", user.id);
  return Response.json({ ok: true });
}
