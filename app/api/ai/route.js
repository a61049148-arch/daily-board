import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODELS = { quick: "claude-haiku-5-5", default: "claude-sonnet-5-5", complex: "claude-sonnet-5-5" };

function parseJson(text) {
  const t = String(text || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(t); } catch (_) {}
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error("no json");
}

export async function POST(req) {
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "not_configured" }, { status: 503 });

  let body;
  try { body = await req.json(); } catch (_) { return Response.json({ error: "bad_request" }, { status: 400 }); }
  const prompt = String(body.prompt || "");
  if (!prompt || prompt.length > 30000) return Response.json({ error: "bad_request" }, { status: 400 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await client.messages.create({
      model: MODELS[body.tier] || MODELS.default,
      max_tokens: 2000,
      system: "You reply with one JSON object only. No prose, no code fences.",
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.filter((c) => c.type === "text").map((c) => c.text).join("");
    return Response.json({ result: parseJson(text) });
  } catch (e) {
    const status = e && e.status;
    if (status === 429) return Response.json({ error: "rate_limited" }, { status: 429 });
    return Response.json({ error: "upstream_error", message: String((e && e.message) || e).slice(0, 200) }, { status: 502 });
  }
}
