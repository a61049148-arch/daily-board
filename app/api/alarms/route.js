// Feed for the iPhone "Daily Board alarms" Shortcut: today's tasks marked "Alarm", as times and labels.
// Signed link (no sign-in) so a Shortcut can read it. Get the link from Settings in the app.
import { adminDb, checkSig, missing, notConfigured, userTz } from "@/lib/push-server";
import { localNow, parseHM } from "@/lib/recur";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (missing().length) return notConfigured();
  const u = new URL(req.url), userId = u.searchParams.get("u") || "", sig = u.searchParams.get("k") || "";
  if (!userId || !checkSig("alarms:" + userId, sig)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const tz = await userTz(userId), now = localNow(tz), all = u.searchParams.get("all") === "1";
  const { data } = await adminDb().from("tasks").select("title,at_time,remind_min").eq("user_id", userId).eq("done", false)
    .eq("alarm", true).eq("due", now.ymd).neq("at_time", "");
  const alarms = (data || []).map((t) => {
    const m = Math.max(0, parseHM(t.at_time) - (Number(t.remind_min) || 0));
    return { time: String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"), mins: m, label: "DB: " + t.title.slice(0, 60) };
  }).filter((a) => all || a.mins > now.mins).sort((a, b) => a.mins - b.mins).map(({ time, label }) => ({ time, label }));
  return Response.json({ date: now.ymd, alarms });
}
