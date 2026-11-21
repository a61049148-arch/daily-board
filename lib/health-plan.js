// Seni's health plan, from the Health HQ artifacts ("Physique Plan: 170 → 185 lb Lean" and the Health HQ app mockup).
// Edit this file when the coaches change the plan. Logs (sets, meals, weight) live in the health_logs table.

export const GOAL = {
  title: "182 lb at about 9% body fat",
  date: "2027-10-24", // 20th birthday
  start: { date: "2026-11-06", weight: 170 },
  phase: "Lean bulk, then a cut",
};

// Monthly checkpoints (target = planned 7-day average weight in lb).
export const CHECKPOINTS = [
  { date: "2026-12-01", target: 172, note: "Hitting calories most days; logging every lift" },
  { date: "2027-02-01", target: 176, note: "Abs still visible; incline press and pull-ups up noticeably" },
  { date: "2027-05-01", target: 181, note: "Shoulders visibly wider in photos; shirts tighter in the arms" },
  { date: "2027-08-01", target: 188, note: "Start the mini-cut (about 2,500 kcal, protein 170 g+)" },
  { date: "2027-10-24", target: 182, note: "Goal 1: compare against the picture" },
];

const P = true;
// [id, name, sets × reps, priority, note]
function ex(list) { return list.map(([id, name, scheme, priority, note]) => ({ id, name, scheme, sets: parseInt(scheme, 10), priority: !!priority, note: note || "" })); }

export const WORKOUTS = {
  upperA: { name: "Upper A", exercises: ex([
    ["incline-db-press", "Incline dumbbell press (30°)", "3 × 6–10", P, "Upper chest priority"],
    ["pull-up", "Pull-ups", "3 × 6–10", P, "Width. Add weight past 12 reps"],
    ["seated-db-shoulder-press", "Seated dumbbell shoulder press", "2 × 8–12"],
    ["chest-supported-row", "Chest-supported row", "3 × 8–12"],
    ["cable-lateral-raise", "Cable lateral raise", "4 × 12–20", P, "Side delts priority"],
    ["incline-db-curl", "Incline dumbbell curl", "3 × 8–12", P],
    ["overhead-cable-triceps", "Overhead cable triceps extension", "3 × 10–15", P, "Long head = arm size"],
  ]) },
  lowerA: { name: "Lower A", exercises: ex([
    ["squat", "Squat or hack squat", "3 × 5–8"],
    ["rdl", "Romanian deadlift", "3 × 6–10"],
    ["leg-extension", "Leg extension", "2 × 10–15"],
    ["seated-leg-curl", "Seated leg curl", "3 × 10–15"],
    ["standing-calf-raise", "Standing calf raise", "4 × 8–12", false, "Pause at the bottom"],
    ["cable-crunch", "Weighted cable crunch", "3 × 10–15", false, "Deeper abs"],
  ]) },
  upperB: { name: "Upper B", exercises: ex([
    ["bench", "Flat barbell or dumbbell bench", "3 × 6–10"],
    ["neutral-pulldown", "Neutral-grip lat pulldown", "3 × 8–12", P],
    ["low-high-fly", "Low-to-high cable fly", "3 × 10–15", P, "Upper chest"],
    ["wide-cable-row", "Wide-grip seated cable row", "3 × 10–12", false, "Upper back thickness"],
    ["db-lateral-raise", "Dumbbell lateral raise", "4 × 12–20", P],
    ["reverse-pec-deck", "Reverse pec deck", "2 × 12–20", false, "Rear delts = rounder shoulders"],
    ["ez-curl", "EZ-bar curl", "3 × 8–12", P],
    ["dips", "Dips or skull crushers", "3 × 8–12", P],
  ]) },
  lowerB: { name: "Lower B", exercises: ex([
    ["leg-press", "Leg press", "3 × 8–12"],
    ["lying-leg-curl", "Lying leg curl", "3 × 8–12"],
    ["bulgarian-split-squat", "Bulgarian split squat", "2 × 8–12 each leg"],
    ["seated-calf-raise", "Seated calf raise", "4 × 10–15"],
    ["hanging-leg-raise", "Hanging leg raise", "3 × 10–15"],
  ]) },
  armsSat: { name: "Delts and arms", optional: true, exercises: ex([
    ["cable-lateral-raise", "Cable lateral raise", "4 × 15–20", P],
    ["cable-curl", "Cable curl", "3 × 10–15", P],
    ["triceps-pushdown", "Triceps pushdown", "3 × 10–15", P],
  ]) },
};

// Index = Date.getDay() (0 = Sunday).
export const WEEK = [
  { rest: "Rest, or boxing if you want it. Get outside early." },
  { workout: "upperA" },
  { workout: "lowerA" },
  { rest: "No lifting today. A good day for boxing." },
  { workout: "upperB" },
  { workout: "lowerB" },
  { workout: "armsSat", note: "Optional, 30 min. Only if you're recovering well." },
];

export const EFFORT = "Compounds: stop 1–2 reps short of failure, rest 2–3 min. Isolations: 0–1 short, rest 1–2 min. Add reps until every set hits the top of the range, then add weight (+5 lb upper, +10 lb lower, +2.5–5 lb dumbbells).";

export const KEY_LIFTS = ["incline-db-press", "pull-up", "bench", "squat", "rdl", "cable-lateral-raise"];

export const TARGETS = { kcal: 3200, protein: 150, proteinMax: 170, fat: "70–90 g", carbs: "about 400–450 g", fatG: [70, 90], carbsG: [400, 450], boxingKcal: 300 };

export const SLEEP = { lightsOut: "23:50", alarm: "08:30" };

// Eating schedule. Only dinner's time came from the plan; the others are defaults Seni can change here.
// carbs and fat are estimates for the planned portions (they add up to the plan's 70–90 g fat and 400–450 g carbs).
export const MEALS = [
  { id: "breakfast", name: "Breakfast", time: "09:30", food: "3 eggs, 2 slices buttered toast, a piece of fruit. Creatine 5 g with it.", kcal: 560, protein: 26, carbs: 62, fat: 22 },
  { id: "lunch", name: "Lunch", time: "13:00", food: "6 oz chicken, 1.5 cups rice, vegetables with olive oil", kcal: 740, protein: 52, carbs: 95, fat: 15 },
  { id: "shake", name: "HQ shake", time: "16:00", food: "2 cups whole milk, 1 scoop whey, ½ cup oats, banana, 1 tbsp peanut butter. After training on lifting days.", kcal: 770, protein: 50, carbs: 92, fat: 22 },
  { id: "dinner", name: "Dinner", time: "19:30", food: "6 oz lean ground beef or salmon, 2 cups pasta or potatoes, vegetables. Big plate, 40 g+ protein.", kcal: 870, protein: 50, carbs: 125, fat: 18 },
  { id: "evening", name: "Evening", time: "22:00", food: "1 cup Greek yogurt, ¼ cup granola", kcal: 290, protein: 23, carbs: 34, fat: 6 },
];

export const FOOD_RULES = [
  "Weigh in every morning after the bathroom. Only the 7-day average counts.",
  "Average not up after 2 weeks: add 200 kcal (a cup of milk and a handful of nuts).",
  "Gaining more than 1 lb a week for 2+ weeks: cut 200 kcal.",
  "Boxing day: add about 300 kcal, mostly carbs.",
];

// Daily routine from the Health HQ home screen, added to Daily Board as repeating Personal tasks.
export const ROUTINE = [
  { title: "Weigh in (before food)", atTime: "08:45", note: "Right after waking. Log it in Health > Progress." },
  { title: "Creatine 5 g", atTime: "09:30", note: "With breakfast." },
  { title: "HQ shake", atTime: "16:00", note: "770 kcal, 50 g protein." },
  { title: "Eat and log dinner", atTime: "19:30", note: "Big plate, 40 g+ protein." },
  { title: "Phone away", atTime: "23:00", note: "Charge it across the room. Read or stretch in dim light." },
  { title: "Lights out", atTime: "23:50", note: "Alarm at 8:30, then 10 minutes outside." },
];

export const COACH_URL = "https://claude.ai/projects";

export function formVideo(name) {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name.replace(/\(.*?\)/g, "").trim() + " proper form");
}
