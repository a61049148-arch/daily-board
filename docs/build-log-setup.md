# Build log, daily recaps and Obsidian vaults

How finished work gets from a Claude session to Daily Board and into the Obsidian vaults.

1. **Logging.** The `build-log` skill adds one row to `public.builds` per finished piece of work
   (area, title, summary, points, what is still open, live, link). Two ways in:
   - Supabase connector: `insert into public.builds (...)` in project `yfxruqacrjuylmneanzp`.
   - Anywhere with a shell: `POST {SUPABASE_URL}/rest/v1/rpc/log_build` with the anon key and
     `{"tok": "<token>", "entry": {...}}`. The token's sha256 lives in `public.api_tokens`.
2. **Board.** "Build log" in the sidebar (phone: Areas tab) lists entries by day with the day's
   recap on top. Each area page has a Log tab with that area's entries and recap.
3. **Recap.** `/api/push/tick` (every minute via pg_cron) calls `runRecap` in `lib/recap.js`.
   After 9 PM local it writes `public.recaps` for today, and rewrites it if more entries arrive.
4. **Vaults.** The Obsidian plugin in `obsidian-plugin/` (Daily Board Sync) calls
   `rpc/vault_feed` every 10 minutes while Obsidian is open and writes, inside the folder
   `Daily Board/`:
   - `Build Log/YYYY-MM.md`: that month's entries, newest day first.
   - `Recaps/YYYY-MM-DD.md`: the recap plus that day's entries.
   Each vault is set to one business in the plugin settings. Files in that folder are regenerated.

## Install the plugin in a vault
Copy `obsidian-plugin/manifest.json` and `main.js` to `<vault>/.obsidian/plugins/daily-board-sync/`,
add `"daily-board-sync"` to `<vault>/.obsidian/community-plugins.json`, then in Obsidian turn on
community plugins (Settings, Community plugins) and fill in the plugin settings.

## New token
```sql
insert into public.api_tokens (token_hash, user_id, label)
values (encode(extensions.digest('<token>', 'sha256'), 'hex'), public.db_owner(), 'label');
```
