// Server-only helpers for phone notifications and the iPhone alarms feed.
// Uses SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and CRON_SECRET. None of these reach the browser.
import crypto from "node:crypto";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { localNow, nextDue, fmtHM, parseHM } from "@/lib/recur";

export const AREA_NAMES = { baselab: "Baselab", dg: "D&G", truenorth: "True North", personal: "Personal" };

export function missing() {
  return ["SUPABASE_SERVICE_ROLE_KEY", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "CRON_SECRET"].filter((k) => !process.env[k]);
}
export function notConfigured() {
  return Response.json({ error: "not_configured", message: "Add " + missing().join(", ") + " in Vercel." }, { status: 503 });
}

let admin = null;
export function adminDb() {
  if (!admin) admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  return admin;
}

let vapidSet = false;
function vapid() {
  if (vapidSet) return;
  const email = (process.env.ALLOWED_EMAIL || "").split(",")[0].trim() || "owner@example.com";
  webpush.setVapidDetails("mailto:" + email, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  vapidSet = true;
}

// Sends one payload to every device in subs. Removes devices whose subscription has expired.
export async function sendAll(subs, payload) {
  vapid();
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3600, urgency: "high" });
      sent++;
    } catch (e) {
      if (e && (e.statusCode === 404 || e.statusCode === 410)) await adminDb().from("push_subs").delete().eq("endpoint", s.endpoint);
    }
  }));
  return sent;
}

export function sign(text) {
  return crypto.createHmac("sha256", process.env.CRON_SECRET).update(text).digest("base64url").slice(0, 32);
}
export function checkSig(text, sig) {
  const a = Buffer.from(sign(text)), b = Buffer.from(String(sig || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function cronOk(req) {
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!process.env.CRON_SECRET || !got) return false;
  const a = Buffer.from(got), b = Buffer.from(process.env.CRON_SECRET);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function userTz(userId) {
  const { data } = await adminDb().from("push_subs").select("tz").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1);
  return (data && data[0] && data[0].tz) || "America/Los_Angeles";
}

// Marks a task done. A repeating task gets its next copy, like in the app.
export async function completeTask(task, tz) {
  const db = adminDb(), today = localNow(tz).ymd;
  await db.from("tasks").update({ done: true, done_on: today }).eq("id", task.id);
  if (task.repeat) {
    const copy = {
      id: "t" + crypto.randomBytes(6).toString("hex"), user_id: task.user_id, title: task.title, area: task.area,
      due: nextDue(task.due, task.repeat, today), person: task.person || "", note: task.note || "", source: task.source || "",
      at_time: task.at_time || "", remind_min: task.remind_min, alarm: !!task.alarm, repeat: task.repeat,
    };
    await db.from("tasks").insert(copy);
  }
}

export function taskPayload(t, lead) {
  const at = parseHM(t.at_time);
  const when = at == null ? "" : lead > 0 ? "In " + (lead >= 60 ? lead / 60 + " hr" : lead + " min") + ", at " + fmtHM(at) : "Now, " + fmtHM(at);
  return {
    title: t.title,
    body: [when, AREA_NAMES[t.area] || ""].filter(Boolean).join(" · "),
    tag: "task-" + t.id,
    url: "/?task=" + encodeURIComponent(t.id) + "#today",
    taskId: t.id,
    sig: sign("task:" + t.id),
  };
}
