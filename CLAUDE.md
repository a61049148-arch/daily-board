# Daily Board: notes for Claude Code

Personal task app for one owner who runs four areas: Baselab (short-form video content agency), D&G Carpet Cleaning, True North (insurance agency and True North Education courses) and Personal. Goal of every change: the owner always knows what to do next, with as little friction as possible. Phone first.

- Plan, decisions and roadmap: https://claude.ai/artifact/4qjJY33fwX4BgokwqpWyZ1 (read it when a task touches scope)
- Design reference (the prototype): https://claude.ai/artifact/N3F5c1Lypj4cQVtAhv943o
- Claude project instructions: docs/claude-project-instructions.md

## How it fits together
- `components/App.jsx` handles Supabase auth, then injects `components/shell.js` markup and calls `startBoard(env)` from `lib/board.js` once.
- `lib/board.js` is the UI: one `state` object, string-template rendering in `render()`, event delegation on `data-act` attributes. Keep it dependency-free. Add a feature by adding state, a render piece and a `data-act` handler.
- Data goes through `env.db` (see `lib/adapters.js`): `collection(c).onSnapshot`, `doc("c/id").set(obj)`, `doc("c/id").delete()`. Objects use camelCase fields; the adapter maps them to snake_case columns via `SPEC`. When you add a column, update `supabase/schema.sql` (as an idempotent change), `SPEC`, and the board.
- `env.sample.json(prompt, {modelTier})` calls `/api/ai` (Claude, JSON-only replies). `env.calendar()` calls `/api/calendar`.
- Server routes check the Supabase token and `ALLOWED_EMAIL` in `lib/server-auth.js`. Never expose `ANTHROPIC_API_KEY` or a Supabase service key to the client.
- Build log: `public.builds` (written by the build-log skill), daily recaps in `public.recaps` (`lib/recap.js`, run from the tick after 9 PM), Obsidian sync plugin in `obsidian-plugin/`. Setup: `docs/build-log-setup.md`.
- Reminders: `public/sw.js` shows pushes. `/api/push/tick` runs every minute from Supabase pg_cron (`supabase/reminders-cron.sql`) and uses the service key via `lib/push-server.js`. `lib/recur.js` holds date logic shared by board and server (repeats, reminder times). Setup steps: `docs/reminders-setup.md`.
- Health: `lib/health-plan.js` holds Seni's plan from Health HQ (workouts, meals with times, targets, checkpoints, daily routine); edit it when the plan changes. `lib/health.js` renders the Health view in the Health HQ look (https://claude.ai/artifact/TFTRiSJZ4WW4pEtKCQsQXP: DM Sans, navy and one blue, `.hq` styles in `app/globals.css`) with Today (steps), Train, Food and Progress, plus the Today card. Logs go to `health_logs` (ids like `w-<day>`, `s-<day>-<exercise>`, `m-<day>-<meal>`, `r-<day>-<step>`).

- Tasks have `priority` ('', high, medium, low) and `claude` ('' not set, yes = Claude can do it, help = Claude helps but needs the owner, you = needs the owner). Set these fields when adding tasks; don't write "Priority:" or "Claude can do this" into the note. A note may start with "Part of: <project>. Step N." and the popup shows it as the project. Rows show priority as !/!!/!!! and a "Claude can do" badge; clicking a task opens the popup (`peekTask`): a centred card with When / Priority / Who does it (plus project, reminder, repeat), notes, the linked person, and a Claude card (Open in Claude, Copy prompt, the prompt behind "See the prompt", built by `claudePrompt`). Area task lists are grouped Overdue / Today / Next 7 days / Later / No date (`dueGroups`).
- Focus: the Focus button opens `focusSheet` (length from the task's block in the day plan, else 25 min). `startFocus` runs a timer that shows in a floating bar and the tab title, survives reloads (localStorage `db-focus`), and at the end `focusAlarm` plays a Web Audio chime, sends a browser notification if allowed, and offers Mark done / 5 or 15 more min. 
- Tasks have `estimateMin` (minutes, null = not set; column `estimate_min`). Set it when adding tasks if you can judge it. Focus uses it as the timer length, Plan my day as the block length. Quick add takes !, !! or !!! for priority and ~30m / ~1.5h for how long.
- Areas: built-in four live in `DEFAULT_AREAS` (`lib/board.js`); the owner's edits and new areas are rows in `public.areas` (merged over the defaults, cached in localStorage, local-only fallback if the table is missing). Use `area(id)`, `col(id)` and `areaIcon(a)`, never hardcode area ids. Server names come from `areaNames()` in `lib/push-server.js`.
- Demo: `/demo` (`components/Demo.jsx`, `lib/demo.js`) runs the board on in-memory sample data with no sign-in. Locally: `npm install`, `npm run demo`, open http://localhost:3000/demo.

## Design rules (the owner rejected gradient/glow "AI" looks)
- Flat, Apple-like: white surfaces, hairline borders, system font, blue as the only button color.
- Area colors appear only as small dots, checkmarks and logos. D&G and True North use their real app icons (in `AREAS[].logo`).
- No emoji, no sparkle icons, no gradients, no glows. Light and dark themes both work through CSS variables in `app/globals.css`.

## Checks before pushing
- `npm run build` passes.
- Try it at 390px wide (phone) and 1280px (desktop).

## Current state
Live at https://daily-board-rho.vercel.app (Vercel project `daily-board`, deploys on push to main).
- Supabase project `daily-board` (ref yfxruqacrjuylmneanzp): schema applied, "Confirm email" off, new sign-ups off, owner account created.
- Vercel env vars all set, including GCAL_ICS_URL ("Seni's Calendar").
- Anthropic key `daily-board-vercel` in the Default workspace, $10/month workspace limit.

## Next up
Follow the kickoff prompt in the plan doc: install, env, local test, fixes, deploy.

## Backlog
The owner adds ideas as Personal tasks titled "App: …". Check them at the start of a session.
