// Daily recap: after 9 PM local, turns the day's build log into a short "what I did today" note.
// Runs from /api/push/tick (every minute). Regenerates only when the number of entries changed.
import Anthropic from "@anthropic-ai/sdk";
import { localNow } from "@/lib/recur";
import { areaNames } from "@/lib/push-server";

const RECAP_AT = 21 * 60;
const MODEL = "claude-sonnet-5-5";

function parseJson(text) {
  const t = String(text || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
}

function prompt(day, builds, AREA_NAMES) {
  const lines = builds.map((b) => {
    const pts = (b.points || []).filter(Boolean).map((p) => "    - " + p).join("\n");
    return `- [${b.area}] ${b.at_time || ""} ${b.title}${b.live ? " (live)" : ""}\n  ${b.summary || ""}${pts ? "\n" + pts : ""}${b.open_items ? "\n  Still open: " + b.open_items : ""}`;
  }).join("\n");
  const areas = [...new Set(builds.map((b) => b.area))];
  return `You write the owner's end-of-day recap for ${day}. The owner runs ${Object.values(AREA_NAMES).join(", ")}. These are the things they finished today, from their build log:

${lines}

Write plain past-tense sentences without "I" or "you", e.g. "Shipped the new sign-in screen for True North Education." No emoji, no hype, no headings.
Return JSON: {"overall": "2 to 4 short sentences covering the whole day, then one sentence starting 'Open:' listing what is still open, if anything", "areas": {${areas.map((a) => `"${a}": "1 to 3 sentences on ${AREA_NAMES[a]} only"`).join(", ")}}}`;
}

export async function runRecap(db, userId, tz) {
  if (!process.env.ANTHROPIC_API_KEY) return false;
  const now = localNow(tz || "America/Los_Angeles");
  if (now.mins < RECAP_AT) return false;
  const { data: builds } = await db.from("builds").select("*").eq("user_id", userId).eq("day", now.ymd).order("at_time");
  if (!builds || !builds.length) return false;
  const { data: prev } = await db.from("recaps").select("build_count").eq("user_id", userId).eq("id", now.ymd).maybeSingle();
  if (prev && prev.build_count === builds.length) return false;
  // Claim the slot first so overlapping ticks don't both call the model.
  await db.from("recaps").upsert({ id: now.ymd, user_id: userId, build_count: builds.length, ...(prev ? {} : { text: "" }) }, { onConflict: "user_id,id" });
  const names = await areaNames(db, userId);
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 900,
      system: "You reply with one JSON object only. No prose, no code fences.",
      messages: [{ role: "user", content: prompt(now.ymd, builds, names) }],
    });
    const out = parseJson(msg.content.filter((c) => c.type === "text").map((c) => c.text).join(""));
    const areas = {};
    for (const [k, v] of Object.entries(out.areas || {})) if (names[k] && v) areas[k] = String(v).slice(0, 1500);
    await db.from("recaps").update({ text: String(out.overall || "").slice(0, 3000), areas }).eq("user_id", userId).eq("id", now.ymd);
    return true;
  } catch (e) {
    // Let the next tick try again.
    await db.from("recaps").update({ build_count: -1 }).eq("user_id", userId).eq("id", now.ymd);
    return false;
  }
}
