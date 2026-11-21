import { requireUser } from "@/lib/server-auth";
import { adminDb, missing, notConfigured, sendAll } from "@/lib/push-server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  if (missing().length) return notConfigured();
  const { data: subs } = await adminDb().from("push_subs").select("*").eq("user_id", user.id);
  if (!subs || !subs.length) return Response.json({ error: "no_devices" }, { status: 404 });
  const sent = await sendAll(subs, { title: "Reminders are on", body: "This is how task reminders will look on this device.", tag: "test", url: "/#today" });
  return Response.json({ sent });
}
