# Phone reminders and iPhone alarms

## What you get
- **Reminders**: give a task a time ("call Sarah tomorrow 3pm") and your phone gets a notification at that time, or 5 to 60 minutes before. Works when the app is closed.
- **Morning summary**: one notification each morning (8 AM by default) with what's on today, what carried over and who to follow up with.
- **App badge**: the Home Screen icon shows how many tasks are on today.
- **iPhone alarms** (optional): tasks marked "iPhone alarm" become real Clock alarms through a Shortcut. These ring even on silent.

On iPhone, notifications only work when Daily Board is opened from the Home Screen (iOS 16.4 or later). iPhone doesn't show Done or Snooze buttons on web notifications; tapping one opens the task, where both are one tap away. Desktop Chrome and Android show the buttons.

## One-time setup (Vercel and Supabase)
1. Run `npm run vapid` and copy the two keys.
2. In Vercel → daily-board → Settings → Environment Variables, add:
   - `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` from step 1
   - `SUPABASE_SERVICE_ROLE_KEY` from Supabase → Project Settings → API (the secret `service_role` key)
   - `CRON_SECRET`: any long random string, for example from `openssl rand -hex 32`
   Then redeploy.
3. In Supabase → SQL Editor, run `supabase/schema.sql` again. The new part at the bottom adds task times, reminders, repeats and the `push_subs` table. It is safe to run twice.
4. In Supabase → SQL Editor, open `supabase/reminders-cron.sql`, replace `<APP_URL>` and `<CRON_SECRET>`, and run it. This checks for due reminders every minute. (Vercel's free plan can only run a job once a day, so the timer lives in Supabase.)

## On the iPhone
1. Open the app in Safari, tap Share, then **Add to Home Screen**.
2. Open Daily Board from the new Home Screen icon and sign in.
3. Tap **Set up** on the Today screen (or Lists → Reminders), then **Turn on reminders** and Allow.
4. Tap **Send a test** to check.

## iPhone alarms Shortcut
A web app can't create Clock alarms, but the Shortcuts app can. Mark a task "iPhone alarm" in its details (it needs a time). Then, once:

1. In the app, open Settings (Lists → Reminders) and tap **Copy link** under iPhone alarms.
2. Open **Shortcuts** → **Automation** → **+** → **Time of Day**. Choose 6:30 AM, Daily, and **Run Immediately**. Tap Next, then **New Blank Automation**.
3. Add **Get Contents of URL** and paste the link.
4. Add **Get Dictionary Value**: Get *Value* for *alarms* in *Contents of URL*.
5. Add **Repeat with Each** item in *Dictionary Value*.
6. Inside the repeat:
   - **Get Dictionary Value**: *Value* for *time* in *Repeat Item*.
   - **Create Alarm** (Clock): time = that *Dictionary Value*, label = (another **Get Dictionary Value** for *label* in *Repeat Item*).
7. Save. Optional: add a second automation at noon so tasks you add during the morning also get alarms. The link only returns alarms that are still ahead today.

Alarm labels start with "DB:" so you can tell them apart in the Clock app. The link is private: anyone with it can see today's alarm titles, so don't share it.
