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

## Design rules (the owner rejected gradient/glow "AI" looks)
- Flat, Apple-like: white surfaces, hairline borders, system font, blue as the only button color.
- Area colors appear only as small dots, checkmarks and logos. D&G and True North use their real app icons (in `AREAS[].logo`).
- No emoji, no sparkle icons, no gradients, no glows. Light and dark themes both work through CSS variables in `app/globals.css`.

## Checks before pushing
- `npm run build` passes.
- Try it at 390px wide (phone) and 1280px (desktop).

## Current state
v1 scaffold: builds, not yet deployed or tested against a real Supabase project.

## Next up
Follow the kickoff prompt in the plan doc: install, env, local test, fixes, deploy.

## Backlog
The owner adds ideas as Personal tasks titled "App: …". Check them at the start of a session.
