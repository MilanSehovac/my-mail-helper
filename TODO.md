# Project completion TODO

Legend: `[x]` done and verified · `[~]` partly done (remaining part stated) · `[ ]` not started.
Last audit: 2026-10-11.

## Product target

A secure outreach workspace where a user can manage agencies and contacts, build reusable templates, create campaign audiences, schedule or immediately send mail, automatically collect delivery/reply events, and see trustworthy campaign and recipient statuses from one overview.

## Current project snapshot

Working now: React/Vite UI that builds cleanly; Express/Sequelize API with JWT auth; every data route is authenticated and scoped to the owning user; CRUD for agencies, contacts, templates and campaigns; encrypted SMTP credentials; a background worker that snapshots the audience, honours the schedule, daily limit, pacing and pause, and sends via SMTP; a signed public unsubscribe flow; real (non-fabricated) campaign counters.

Still missing for the main promise: **provider events and reply tracking** (nothing yet learns about bounces, opens, clicks or replies), a **real unified dashboard**, detail/edit pages, CSV import, retries, and broad automated tests. The worker runs inside the API process (state is in MySQL, so restarts are safe, but it is not a separate service).

### What the 2026-10-11 pass changed

- **Frontend build fixed** (`npm --prefix frontend run build` passes). Settings components now share one `data/onChange/onSave` contract; fake billing/plan and fake campaign metrics (hard-coded open/reply/bounce rates, sparklines) removed; forms no longer reload the page on submit and show API errors; contact delete calls the contact API; dead edit/preview/duplicate/detail links removed; auth redirects go to `/auth` instead of the non-existent `/login`.
- **Ownership & authorization**: `user_id` added to agencies and contacts (migration `20261011090000`); all controllers filter by the authenticated user; contact → agency, campaign → template/segment are ownership-checked. Contact and email-settings routes now require auth (the email-settings GET used to return a hard-coded personal Gmail account).
- **Security hardening**: env validation at startup (JWT secret and encryption key ≥ 32 chars), helmet, CORS allow-list (`CORS_ORIGINS`), 100 kb body limit, rate limits on login/register/test-email, JWT pinned to HS256, password policy (12–72 chars), generic 500 messages, DB failure now exits instead of serving.
- **SMTP**: passwords encrypted at rest (AES-256-GCM, `SMTP_ENCRYPTION_KEY`), never returned (`has_password` flag only), blank password on update keeps the saved one, SSRF guard (port allow-list; blocks loopback/private/link-local targets; `ALLOW_PRIVATE_SMTP_HOSTS=true` for local dev), test email goes only to the user's own account address, header-injection-safe From.
- **Sending**: replaced the in-request loop (3-minute `setTimeout`s, one contact per agency, wrong enum values, `sender.name` that doesn't exist) with `services/campaignWorker.js`. Campaign lifecycle is now Paused → (Scheduled →) Sending → Completed; launch snapshots the audience into `campaign_contacts` (unique per campaign+contact, de-duplicated by email, subscribed only); atomic claim per recipient; pause takes effect before the next message; interrupted sends are marked Failed instead of blindly retried.
- **Templates**: documented variable set (`full_name, first_name, last_name, email, position, status, tag, agency_name, location, website, sender_name, sender_email, current_date`); unknown variables rejected at template save, campaign create and send time; values HTML-escaped; text + HTML parts. Categories are free text (the UI offered values the DB enum rejected). A template used by a campaign cannot be deleted or edited while that campaign is active.
- **Unsubscribe**: footer link + `List-Unsubscribe`/One-Click headers; GET only shows a confirmation (scanner-safe), POST suppresses the contact and skips their pending sends.
- **Cleanup**: removed the broken, unused legacy `backend/models/` (CommonJS, referenced a non-existent `config.json`); fixed `./Routes/…` import casing; removed fake 2FA toggle and billing endpoints; added `.env.example` for backend and frontend, `npm test` (unit tests), `npm run migrate`, and `backend/scripts/smoke.mjs` (end-to-end check against a local fake SMTP server — 36 assertions, all passing).

**Upgrade note:** rows created before the ownership migration have `user_id = NULL` and are hidden by the API. Assign them with `UPDATE agencies SET user_id = <id> WHERE user_id IS NULL;` (same for `contacts`). The dev database had no such rows. New required env vars: `SMTP_ENCRYPTION_KEY` (and `CORS_ORIGINS`, `PUBLIC_API_URL` for non-default setups) — see `backend/.env.example`. Existing plaintext SMTP passwords keep working and are encrypted the next time they're saved.

---

## P0 — Decide and secure the foundation before real outreach

- [x] **Define account boundaries.** Single-owner-per-record model: every agency, contact, template, campaign, recipient list and SMTP setting belongs to one user and is checked on every read/update/delete/launch. (A shared multi-user workspace would still need a workspace ID — only do that if teams are a goal.)
- [x] **Protect every API route.** Contact and email-settings routes authenticated; all other routes were audited and scoped; 401/404 behaviour verified for cross-account access in the smoke test.
- [~] **Define contact permission and suppression policy.** Done: `source`, `unsubscribed_at`, `suppression_reason` on contacts; signed public unsubscribe; suppression checked immediately before every send. **Remaining:** consent/legal-basis and consent timestamp fields, a suppression list for addresses not (or no longer) in contacts, a UI to view suppressed contacts, a deliberate audited re-subscribe action, and automatic suppression on bounce/complaint (needs P2 events).
- [ ] **Choose the email delivery provider and supported events.** SMTP remains the only transport. Decide whether to move to a provider with signed delivery/bounce/complaint/inbound webhooks (SES, Mailgun, Postmark, …) — this blocks all of P2. Document which statuses are authoritative; opens are inherently imperfect.
- [~] **Design the delivery data model before implementing the worker.** Done: `campaign_contacts` is the per-recipient source of truth with a unique `(campaign_id, contact_id)`, status, `sent_at`, `claimed_at`, `attempts`, `last_error`, `provider_message_id`; `campaigns.sent/total` are recomputed from those rows. **Remaining:** an append-only event/audit table, delivered/bounced/replied timestamps, and removing/using `campaign_agencies` (currently unused by the sender).
- [~] **Normalize status transitions.** Enums reconciled (`Pending→Sending→Sent|Failed|Skipped`, campaign `Paused→Scheduled/Sending→Completed`), conditional updates prevent double launch/overwrites. **Remaining:** explicit transition table enforced in one place, and rules for provider events that arrive late/duplicated (needs P2).
- [x] **Protect SMTP credentials and email endpoints.** Encrypted at rest, never returned, hard-coded account removed, test-email authenticated + rate-limited + sent only to the account's own address, host/port SSRF guard. *Caveat:* the guard resolves DNS at check time; a DNS-rebinding attacker could still race it — acceptable for now, pin the resolved IP if the app becomes multi-tenant public SaaS. Sender identity (SPF/DKIM alignment of `from_email`) is not verified.
- [~] **Harden auth and API inputs.** Done: body validation on all controllers, ID parsing, password policy, rate limits, CORS allow-list, helmet, startup env validation. **Remaining:** per-field schema validation library (zod/joi) instead of ad-hoc checks, token revocation / shorter-lived tokens with refresh (a changed password does not invalidate existing JWTs), email verification and password reset, and moving the token out of `localStorage` (httpOnly cookie + CSRF) before production.
- [ ] **Set data-retention and privacy rules.** Decide retention for contact data, email content, event logs; implement per-contact deletion/export compatible with suppression (keep the suppressed address, drop the rest) and account deletion.

## P1 — Make scheduling and sending durable and correct

- [x] **Build a stable campaign audience.** Snapshot taken at launch (idempotent), de-duplicated by normalized email, only subscribed contacts of the user's agencies in the target segment; the count shown at creation uses the same query.
- [~] **Support campaign review and lifecycle.** States Paused/Scheduled/Sending/Completed with launch, pause and resume. **Remaining:** a review/confirm screen (sender, rendered preview with a real contact, audience, schedule, limits), explicit Cancelled/Failed states, and editing schedule/template of a paused campaign (currently only name, description, daily limit).
- [~] **Implement timezone-aware scheduling.** `scheduled_at` is stored as a UTC instant, validated as future, and honoured by the worker. **Remaining:** store/display the user's IANA timezone, quiet hours, and defined behaviour when a schedule is edited (the UI converts browser-local time → UTC).
- [~] **Move sending out of the web request process.** Sending no longer happens in the request; state is durable in MySQL and the atomic claim lets several processes coexist. **Remaining:** run the worker as its own process/entry point (`node src/worker.js`) so API restarts/deploys don't pause sending, and use a real queue (the `REDIS_*` env vars hint at BullMQ) if volume grows.
- [~] **Implement safe delivery controls.** Rolling-24h daily limit per campaign, minimum gap between messages (`MAIL_SEND_INTERVAL_MS`), pause/unsubscribe checked right before each send. **Remaining:** provider/account-wide daily caps across campaigns, quiet hours, concurrency limits.
- [ ] **Add retries without duplicate mail.** Currently a failed recipient is `Failed` and never retried; interrupted sends are deliberately not retried (delivery unknown). Add classification of transient vs permanent SMTP errors, bounded exponential backoff with jitter for transient ones, a manual "retry failed" action, and an idempotency strategy (e.g. dedupe by Message-ID with the provider).
- [x] **Make template rendering reliable.** Documented variables mapped to real fields, unknown variables fail (save/launch/send), HTML escaped, plain-text and HTML alternatives, preview uses the full variable set. *Not done:* preview against a real contact (UI preview uses sample data).
- [~] **Make campaign updates safe during work.** Delete is blocked while Scheduled/Sending and removes recipients; active-campaign templates can't be edited/deleted; pause is conditional. **Remaining:** versioning/snapshotting of template content per campaign so history stays accurate after later template edits.
- [~] **Add database migrations and indexes for workflow scale.** Added indexes (`campaigns(status, scheduled_at)`, `campaign_contacts(campaign_id,status)`, contacts/agencies by user/agency), unique recipient constraint, `npm run migrate`. **Remaining:** foreign key `campaigns.template_id → templates.id`, tested rollback on a populated DB (down migration written but untested with data), deployment migration step in CI.

## P2 — Automatically track outcomes and provide a real overview

(Blocked on the provider decision in P0.)

- [ ] **Receive provider events.** Webhook endpoints with signature verification, payload validation, dedupe by provider event ID, persistence, retry-compatible acks; map delivery/bounce/complaint/open/click to recipient rows and suppress bounced/complained contacts.
- [ ] **Track replies.** Inbound strategy (provider inbound webhook or monitored IMAP mailbox), correlate via `Message-ID`/`In-Reply-To` (`provider_message_id` is already stored), ignore auto-replies/out-of-office, store reply time and thread ID. Don't mark replies from a manual UI action unless labelled.
- [ ] **Define tracking limitations and privacy.** If opens/clicks are added: disclosures, signed URLs, bot/proxy filtering, "estimated" labels. Unsubscribe is already independent of tracking.
- [ ] **Add a recipient activity timeline.** Queued/attempted/sent/delivered/bounced/replied/unsubscribed/failed with timestamps and reasons (the data for sent/failed/skipped already exists in `campaign_contacts`; there is no API or UI for it yet).
- [~] **Replace fabricated metrics.** Campaign summary cards now show only persisted numbers (sent, campaign count, active, completed). Agency summary uses real counts. **Remaining:** rates/trends need events; define denominators once events exist.
- [ ] **Create the unified overview dashboard.** Scheduled/active campaigns, next sends, recent outcomes, failures needing action, reply/bounce queues, filters, links. Today `/agencies` doubles as the home page.
- [ ] **Add event and reporting reconciliation.** Replay/reconcile provider events, recompute aggregates idempotently, retain raw payloads for audit.

## P2 — Complete the user-facing workflows

- [x] **Fix the frontend build.** Passes locally. **Still to do:** run `npm run build` and `npm test` in CI (no CI exists yet); the bundle is ~500 kB — code-split routes with `React.lazy`.
- [~] **Finish agency and contact CRUD.** Create/list/delete work for both, with validation and error display; backend update endpoints exist and are validated. **Remaining:** agency detail page (`/agency/:id` is a placeholder), edit forms for agencies and contacts in the UI, success feedback/toasts, status changes for contacts, and replacing `alert()` with a proper toast component.
- [~] **Finish campaign CRUD and controls.** Create, launch/resume, pause, delete work and show real progress. **Remaining:** campaign detail page (recipients, per-recipient status/errors, schedule, template preview), edit page, review step before launch.
- [~] **Finish template actions.** Create/list/delete work; unusable preview/duplicate/edit buttons were removed rather than left dead. **Remaining:** edit page (API exists), duplicate, preview with a real contact.
- [x] **Fix form submission behavior.** Agency/contact/template/campaign forms prevent default submit, validate required fields, show errors, disable while submitting, and navigate on success.
- [~] **Complete settings integration.** Profile, SMTP (save + test), notifications and password change are wired and match the API contracts; billing is an honest "not available" placeholder and the fake 2FA toggle is gone. **Remaining:** feedback for profile/notification save failures (currently only logged), real 2FA if wanted, avatar upload (button is inert).
- [ ] **Implement or remove promised import/export.** No CSV import/export exists (the misleading "import from CSV" copy on Add Contact was removed). Build import with header mapping, validation, dedupe, preview and per-row errors; export only the account's own data.
- [ ] **Improve list usability.** Lists load everything and filter client-side. Add server-side pagination/search/filter/sort; unify segment/status vocabularies across forms, API and DB (agency statuses vs campaign statuses vs contact statuses).

## P3 — Prove production readiness

- [~] **Add automated tests.** Added: backend unit tests (`npm test` — secrets, renderer, SMTP guard, unsubscribe token) and an end-to-end smoke script (`node scripts/smoke.mjs`: auth, tenant isolation, validation, SMTP encryption, worker send, unsubscribe). **Remaining:** proper API test suite against a throwaway DB in CI (state-machine, pause/cancel races, worker concurrency/restart), frontend component tests (Vitest + Testing Library).
- [ ] **Add integration tests with a fake mail provider.** The smoke script's minimal SMTP sink is a starting point; extend to timeouts, duplicate webhooks, bounces, unsubscribe races, concurrent workers.
- [~] **Add deployment health and operations.** `/health` (liveness) and `/ready` (DB check) added; server exits if the DB is unreachable at startup. **Remaining:** worker health/last-tick exposure, graceful drain of an in-flight send on shutdown, migration/rollback runbook, Dockerfile/CI.
- [ ] **Add observability.** Structured logs with campaign/recipient correlation IDs (currently `console.log`), metrics/alerts for queue lag, failure and bounce rates, worker restarts. Avoid logging credentials/personal data.
- [~] **Document configuration and local setup.** `.env.example` for backend and frontend. **Remaining:** a root README with setup steps (install, create DB, `npm run migrate`, run API + web, run tests), webhook/provider setup once chosen, production notes.
- [x] **Fix portability and remove ambiguity.** Route import casing fixed; the unused legacy `backend/models/` directory was removed (it was recoverable from git if ever needed). Also consider git-ignoring `.idea/` (partly tracked).
- [ ] **Add backup and recovery procedures.** Backup of campaign/recipient/event state, tested restore, and a queue-recovery step (the worker already fails stale `Sending` rows after 10 min; document what an operator should do about them).

## Suggested delivery order (remaining work)

1. Choose the delivery provider (P0) — unblocks bounce/complaint suppression, replies and real analytics.
2. Event table + webhook ingestion + auto-suppression; reply correlation (P2).
3. Split the worker into its own process; add retries/backoff and manual retry (P1).
4. Detail/edit pages, review-before-launch step, pagination, CSV import (P2 UX).
5. Real dashboard from persisted events.
6. CI (build + tests + migrations), root README, observability, backups (P3).

## Definition of complete

- A user can securely manage only their own agencies, contacts, templates, campaigns, and mail configuration. ✅ (single-owner model; enforced and tested)
- A campaign can be previewed against an exact eligible audience, scheduled, or sent now, and safely paused/cancelled. ◐ (audience exact, schedule/send/pause work; no review screen, timezone, or cancel state yet)
- Worker restarts, retries, duplicate requests, and duplicate provider webhooks do not cause duplicate sends or incorrect statuses. ◐ (unique recipients, atomic claim, no blind retry; no webhooks yet)
- Suppressed contacts are never sent to; unsubscribe and bounce/complaint events update suppression automatically. ◐ (unsubscribe done; bounce/complaint pending)
- Delivery/reply outcomes shown in the UI come from persisted events and are traceable per recipient, with limitations clearly explained. ◐ (sent/failed are persisted; delivery/reply/bounce are not tracked yet)
- Core workflows are covered by automated tests; frontend build, migrations, health checks, and documented deployment setup pass in CI. ◐ (unit + smoke tests and health endpoints exist; no CI, no README)
