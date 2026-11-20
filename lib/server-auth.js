import { createClient } from "@supabase/supabase-js";

// Checks the Supabase access token sent by the app and that the email is on ALLOWED_EMAIL.
export async function requireUser(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || token === "undefined") return Response.json({ error: "unauthorized" }, { status: 401 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const allowed = (process.env.ALLOWED_EMAIL || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowed.length || !allowed.includes(String(data.user.email || "").toLowerCase())) {
    return Response.json({ error: "forbidden", message: "Set ALLOWED_EMAIL to your email in Vercel." }, { status: 403 });
  }
  return data.user;
}
