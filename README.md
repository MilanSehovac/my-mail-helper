# my-mail-helper

Outreach workspace: manage agencies and contacts, write templates, and send campaigns over your own SMTP account with scheduling, a daily limit, pause/resume and one-click unsubscribe.

- `backend/` – Express + Sequelize (MySQL) API and the background sending worker
- `frontend/` – React + Vite + TypeScript UI

See [TODO.md](TODO.md) for status and the remaining roadmap.

## Setup

Requirements: Node 22+, MySQL 8 (or MariaDB 10.6+).

```bash
# 1. Database
mysql -u root -e "CREATE DATABASE mailing_tracker CHARACTER SET utf8mb4"

# 2. Backend
cd backend
cp .env.example .env        # then fill in JWT_SECRET and SMTP_ENCRYPTION_KEY (32+ random chars each)
npm install
npm run migrate
npm run dev                 # API on http://localhost:8000 (also runs the sending worker)

# 3. Frontend (second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
Changing `SMTP_ENCRYPTION_KEY` makes already-saved SMTP passwords unreadable (re-enter them in Settings).

### Sending worker

By default the API process also runs the worker. To run it separately (so API restarts don't pause sending):

```bash
RUN_WORKER=false npm start   # API only
npm run worker               # worker only
```

Running both at once is safe; recipients are claimed atomically in MySQL, so no message is sent twice. No Redis or other queue is required.

### Trying it without a real mailbox

Run a local SMTP catcher such as [MailHog](https://github.com/mailhog/MailHog) or `smtp4dev` and set `ALLOW_PRIVATE_SMTP_HOSTS=true` in `backend/.env`; then use `localhost` / port `1025` in Settings → Email. (Without that flag the API refuses private/loopback SMTP hosts and ports other than 25, 465, 587, 2525.)

## Tests

```bash
cd backend && npm test                 # unit tests, no database needed
cd backend && node scripts/smoke.mjs   # end-to-end check; needs the migrated dev database, creates and deletes its own users
cd frontend && npm run build           # type-check + production build
```

## Upgrading from a pre-ownership database

Agencies/contacts created before migration `20261011090000` have `user_id = NULL` and are hidden. Assign them:

```sql
UPDATE agencies SET user_id = 1 WHERE user_id IS NULL;
UPDATE contacts SET user_id = 1 WHERE user_id IS NULL;
```

## Operations

- `GET /health` – process is up; `GET /ready` – database reachable.
- Recipients stuck in `Sending` for more than 10 minutes (crash mid-send) are marked `Failed` with "delivery unknown". They are not retried automatically because the mail may have been delivered; use "Retry failed" on the campaign page after checking the mailbox's Sent folder.
