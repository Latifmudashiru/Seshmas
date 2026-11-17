# Seshmas

A tiny Friendsmas party app: join with a party code, browse guests and their socials,
play with a live leaderboard, DM other guests, and share your own QR code. Vite + React + Supabase.
This is a first draft for testing.

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. (If you ran an older
   version before, run only the "PART 2: DIRECT MESSAGES" block at the bottom - it adds the `messages` table and is safe to re-run.)
3. Go to **Project Settings -> API** and copy the **Project URL** and the **anon public key**.
4. Copy `.env.example` to `.env` and fill it in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_PARTY_CODE=SESHMAS
   ```
5. `npm install`
6. `npm run dev`

Restart the dev server after editing `.env`.

## Demo mode

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are not set (no `.env`), the app runs in
offline demo mode: no Supabase project needed. Data is stored in this browser's localStorage
(keys starting `seshmas_demo_`), with a few fake guests and scores seeded on first load. Two tabs
in the same browser update each other live. The party code is `SESHMAS` (or `VITE_PARTY_CODE`).
A banner at the top has a **Reset demo** button that wipes the demo data and your player.
Demo data is per-browser, so it is not shared between devices; scanning a QR on another phone
will show "Player not found". Add the Supabase env vars and restart to use the real backend.

## Testing on a phone

Run `npm run dev -- --host`, then open the "Network" URL it prints (for example
`http://192.168.1.20:5173`) on your phone. Both devices must be on the same wifi.
The My QR code encodes the address you opened the app from, so open the app via the
Network URL (not localhost) on the device that shows the QR.

## Notes

- The database policies in `schema.sql` are wide open (draft only) and will be tightened later.
- Guests list shows names only; tapping a guest opens their profile (socials + Message button). Chats are 1-to-1 DMs.
- Profile cards live at `/?p=<playerId>` (that is what the QR codes point to).
