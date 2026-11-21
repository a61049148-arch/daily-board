import { requireUser } from "@/lib/server-auth";
import { missing, notConfigured, sign } from "@/lib/push-server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  if (missing().length) return notConfigured();
  const origin = new URL(req.url).origin;
  return Response.json({ url: origin + "/api/alarms?u=" + encodeURIComponent(user.id) + "&k=" + sign("alarms:" + user.id) });
}
