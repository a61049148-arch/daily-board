// Coach-style form guides shown in the Form popup. One entry per exercise id
// from WORKOUTS in health-plan.js. Exercises with a guide and a 3D demo in
// form3d.js get the in-app popup; the rest keep the video link.
export const FORM_GUIDES = {
  "incline-db-press": {
    muscles: ["Upper chest", "Front shoulders", "Triceps"],
    setup: "Set the bench to about 30°. Sit with the dumbbells on your knees, then lie back and kick them up one at a time.",
    steps: [
      "Feet flat and wide. Pinch your shoulder blades back and down into the bench.",
      "Start with the dumbbells over your upper chest, arms straight but not locked.",
      "Lower for 2 seconds to the sides of your upper chest. Elbows about 45° from your body, wrists stacked over elbows.",
      "Feel the stretch, then press up and slightly in until the bells almost touch.",
    ],
    cues: ["Chest up, shoulders pinned to the bench", "Elbows under the wrists the whole way", "Stop 1–2 reps before you can't do another"],
    avoid: ["Elbows flared straight out to the sides", "A bench so steep it turns into a shoulder press", "Bouncing out of the bottom"],
    breathing: "Breathe in on the way down, out as you press.",
  },
};

export function formGuide(id) { return FORM_GUIDES[id] || null; }
