# Daily Board

A personal task board for running several businesses at once: Today with a Now card, a day timeline from Google Calendar, Plan my day and Brain dump with Claude, people and follow-ups, and notes per business. Installs to your phone's home screen.

Stack: Next.js (App Router) on Vercel, Supabase (Postgres, auth, realtime), Anthropic API, Google Calendar through its private iCal link.

## Set up (about 15 minutes, once)

### 1. Supabase
1. Create a project at supabase.com (any region near you).
2. SQL Editor → paste all of `supabase/schema.sql` → Run.
3. Authentication → Sign In / Providers → Email: turn **off** "Confirm email" (you'll turn sign-ups off after step 3).
4. Project Settings → API: copy the **Project URL** and the **anon / publishable key**.

### 2. Vercel
1. vercel.com → Add New → Project → import the `daily-board` GitHub repo.
2. Environment variables (Settings → Environment Variables):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `ALLOWED_EMAIL` | the email you'll sign in with |
| `ANTHROPIC_API_KEY` | from console.anthropic.com |
| `GCAL_ICS_URL` | Google Calendar → Settings → your calendar → Integrate calendar → **Secret address in iCal format** |

3. Deploy. Your app lives at `https://<project>.vercel.app`.

### 3. First sign-in
1. Open the Vercel URL → "Create your account" with the email in `ALLOWED_EMAIL`.
2. Back in Supabase → Authentication → Sign In / Providers → turn **off** "Allow new users to sign up". Now nobody else can make an account.

### 4. Put it on your phone
iPhone: open the URL in Safari → Share → **Add to Home Screen** → open it from the icon and sign in once.
Android: Chrome menu → **Install app**.

## Develop

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```

- `lib/board.js`: the whole UI (plain DOM rendering, one `render()`), started by `components/App.jsx`.
- `lib/adapters.js`: maps the board's data calls to Supabase tables and the API routes.
- `app/api/ai`: Claude calls for Plan my day (Sonnet) and Brain dump (Haiku).
- `app/api/calendar`: reads the private iCal link and returns the next 10 days of events.
- `supabase/schema.sql`: tables `tasks`, `people`, `notes`, `plans` with row level security.
- `npm run icons`: regenerates the home-screen icons.

## Ideas for next versions
- Push notifications (Web Push; iOS supports it for home-screen apps).
- Text a phone number to add todos (Twilio webhook → insert into `tasks`).
- Morning plan generated automatically (Vercel Cron → `/api/ai`).
- Pull todos from the True North and D&G Obsidian vaults.
