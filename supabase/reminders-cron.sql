-- Runs the reminder check every minute (Vercel's free plan only allows daily cron jobs).
-- Run once in Supabase → SQL Editor after the app is deployed.
-- Replace the two placeholders first:
--   <APP_URL>      e.g. https://daily-board-rho.vercel.app
--   <CRON_SECRET>  the same value as CRON_SECRET in Vercel
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('daily-board-reminders') where exists (select 1 from cron.job where jobname = 'daily-board-reminders');
select cron.schedule('daily-board-reminders', '* * * * *', $$
  select net.http_post(
    url     := '<APP_URL>/api/push/tick',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>', 'Content-Type', 'application/json'),
    body    := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
$$);
