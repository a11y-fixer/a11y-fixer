-- a11y-fixer control plane schema (Supabase Postgres).
--
-- M1 ships the installation lifecycle tables (installations, repos) and the
-- webhook_events idempotency ledger. M2 adds scans/violations and the dashboard
-- auth model (users, user_installations) with row-level security. The webhook
-- sink uses the SERVICE-ROLE key, which bypasses RLS, so ingestion is
-- unaffected; only the dashboard's user-scoped client (anon key + the user's
-- Supabase Auth JWT) is constrained by the policies below.

-- Idempotency ledger. One row per X-GitHub-Delivery; the UNIQUE constraint makes
-- a replayed delivery a no-op insert (see SupabaseStore.recordEventOnce).
create table if not exists webhook_events (
  delivery_id text primary key,
  received_at timestamptz not null default now()
);

-- Anonymous, opt-in Action usage events. One row per run where the caller sets
-- `telemetry: on`. Carries NO repo/account/actor/commit identity — only coarse
-- counts and environment so the author can answer "how many / when did someone
-- run the Action". Written with the service-role key (bypasses RLS); RLS is
-- enabled with no policy so the anon/dashboard client can never read it.
create table if not exists action_runs (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  action_version    text,
  mode              text not null,
  licensed          boolean not null default false,
  public_repo       boolean not null default false,
  violations_before integer not null default 0,
  violations_after  integer not null default 0,
  fixes_applied     integer not null default 0,
  fixes_reverted    integer not null default 0,
  regressions       integer not null default 0,
  used_url          boolean not null default false,
  used_html         boolean not null default false,
  used_markdown     boolean not null default false,
  used_components   boolean not null default false,
  platform          text,
  arch              text,
  node_version      text
);

create index if not exists action_runs_created_at_idx on action_runs (created_at);

alter table action_runs enable row level security;

-- One row per GitHub App installation.
create table if not exists installations (
  installation_id bigint primary key,
  account         text   not null,
  account_id      bigint not null,
  suspended_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Repos in an installation's selected scope.
create table if not exists repos (
  repo_id         bigint primary key,
  installation_id bigint not null references installations(installation_id) on delete cascade,
  full_name       text   not null,
  private         boolean not null default false,
  default_branch  text,
  selected        boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists repos_installation_id_idx on repos (installation_id);

-- M2: the Action's Check Run results, ingested from `check_run` webhooks.
-- One row per completed `a11y-fixer` Check Run (check_run_id is its GitHub id).
-- violation_count is the exact total from the Action's embedded scan contract
-- (output.text) when present, else the Check Run's annotation count. Per-rule
-- detail rows live in `violations`.
create table if not exists scans (
  check_run_id    bigint primary key,
  repo_id         bigint not null references repos(repo_id) on delete cascade,
  installation_id bigint not null references installations(installation_id) on delete cascade,
  head_sha        text   not null,
  pr_number       integer,
  conclusion      text,
  violation_count integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists scans_repo_id_idx on scans (repo_id);
create index if not exists scans_installation_id_idx on scans (installation_id);

-- Per-violation detail for a scan, parsed from the Action's embedded scan
-- contract. Replaced wholesale on a redelivered completion (the handler deletes
-- by check_run_id then re-inserts); ON DELETE CASCADE also clears them when the
-- scan row is removed. Optional: the dashboard works off scans.violation_count
-- without it, so an older Action that emits no contract records no rows here.
create table if not exists violations (
  id           bigint generated always as identity primary key,
  check_run_id bigint not null references scans(check_run_id) on delete cascade,
  rule_id      text   not null,
  wcag_id      text   not null,
  impact       text   not null,
  description  text   not null,
  help_url     text   not null,
  path         text,
  line         integer
);

create index if not exists violations_check_run_id_idx on violations (check_run_id);

-- M2 dashboard auth. One row per signed-in dashboard user, keyed by their
-- Supabase Auth id (auth.users.id = auth.uid()). GitHub identity is captured at
-- OAuth time for display and installation reconciliation.
create table if not exists users (
  id             uuid primary key references auth.users(id) on delete cascade,
  github_login   text   not null,
  github_user_id bigint not null unique,
  created_at     timestamptz not null default now()
);

-- Which installations a user may view, reconciled at login from GitHub's
-- `GET /user/installations`. Drives every RLS policy below.
create table if not exists user_installations (
  user_id         uuid   not null references users(id) on delete cascade,
  installation_id bigint not null references installations(installation_id) on delete cascade,
  added_at        timestamptz not null default now(),
  primary key (user_id, installation_id)
);

create index if not exists user_installations_installation_id_idx on user_installations (installation_id);

-- M3: GitHub Marketplace subscriptions, ingested from `marketplace_purchase`
-- webhooks. One row per purchasing account (account_id mirrors
-- installations.account_id), so a purchase can land before the App is installed.
-- Cancellation is a soft-delete (cancelled_at set, row kept) for billing history.
create table if not exists subscriptions (
  account_id             bigint primary key,
  account                text    not null,
  plan_id                bigint  not null,
  plan_name              text    not null,
  monthly_price_in_cents integer not null,
  unit_count             integer not null default 1,
  on_free_trial          boolean not null default false,
  free_trial_ends_on     date,
  next_billing_date      date,
  cancelled_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- M5: free-tier license keys, one per installation. Minted by the control plane
-- with the Ed25519 signing key (LICENSE_SIGNING_KEY) and verified offline by the
-- Action. Persisted so the dashboard shows a stable key; re-minted only when the
-- stored token has expired. The token is a bearer credential for private-repo
-- scans, so RLS restricts reads to members of the installation (below).
create table if not exists licenses (
  installation_id bigint primary key references installations(installation_id) on delete cascade,
  sub             text        not null,
  token           text        not null,
  issued_at       timestamptz not null default now(),
  expires_at      timestamptz not null
);

-- Phase 1 (conformance docs): an audit is a VPAT/ACR evaluation of a repo at a
-- point in time. It opens as a machine-derived draft (from a scan's violations
-- crossed with the WCAG catalog in @a11y-fixer/core) that human testers then
-- review. See packages/app/src/conformance/*.
create table if not exists audits (
  id                 uuid primary key default gen_random_uuid(),
  repo_id            bigint not null references repos(repo_id) on delete cascade,
  installation_id    bigint not null references installations(installation_id) on delete cascade,
  head_sha           text   not null,
  -- The scan the draft was derived from. SET NULL (not CASCADE): keep the audit
  -- as a historical record even if the underlying scan row is later pruned.
  basis_check_run_id bigint references scans(check_run_id) on delete set null,
  status             text   not null default 'draft'
                       check (status in ('draft', 'in_review', 'published')),
  created_at         timestamptz not null default now(),
  published_at       timestamptz
);

create index if not exists audits_installation_id_idx on audits (installation_id);
create index if not exists audits_repo_id_idx on audits (repo_id);

-- One verdict per (audit, success criterion, source). `source='machine'` rows are
-- the derived draft; `source='human'` rows are tester evaluations that confirm or
-- override the machine draft (Phase 2). `verdict` uses the VPAT conformance
-- vocabulary. `evidence` is JSON owned by the app (violation refs, impact counts,
-- screenshots, assistive tech) — the DB does not constrain its shape.
create table if not exists criterion_verdicts (
  id         uuid primary key default gen_random_uuid(),
  audit_id   uuid not null references audits(id) on delete cascade,
  wcag_id    text not null,
  source     text not null check (source in ('machine', 'human')),
  verdict    text not null
               check (verdict in ('supports', 'partially_supports', 'does_not_support', 'not_applicable', 'not_evaluated')),
  remarks    text not null default '',
  evidence   jsonb,
  author_id  uuid references users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (audit_id, wcag_id, source)
);

create index if not exists criterion_verdicts_audit_id_idx on criterion_verdicts (audit_id);

-- Phase 4 (distribution): an immutable published revision of an audit's
-- conformance documents. Created when an audit is published; `snapshot` freezes
-- the reconciled record + metadata the renderers need, so a published document
-- never changes even if the WCAG catalog or repo metadata later changes in code.
-- `public_slug` is an unguessable capability token for the public, unauthenticated
-- statement permalink. `version` increments per repo across its published audits.
create table if not exists audit_revisions (
  id              uuid primary key default gen_random_uuid(),
  -- One revision per audit: a published audit is finalized and published once.
  audit_id        uuid not null unique references audits(id) on delete cascade,
  repo_id         bigint not null references repos(repo_id) on delete cascade,
  installation_id bigint not null references installations(installation_id) on delete cascade,
  version         integer not null,
  public_slug     text not null unique,
  snapshot        jsonb not null,
  head_sha        text not null,
  published_at    timestamptz not null default now(),
  -- Per-repo version numbering is dense and unique.
  unique (repo_id, version)
);

create index if not exists audit_revisions_repo_id_idx on audit_revisions (repo_id);
create index if not exists audit_revisions_installation_id_idx on audit_revisions (installation_id);
-- The public permalink looks a revision up by slug; keep that lookup indexed.
create unique index if not exists audit_revisions_public_slug_idx on audit_revisions (public_slug);

-- Phase 1: the Conformance Ledger. An append-only, Ed25519-signed, per-subject
-- chained log of conformance claims with content-addressed evidence. Signed with
-- the DEDICATED conformance key (CONFORMANCE_SIGNING_KEY), never the license key.
-- Design: docs/conformance/claim-model.md + phase-1-ledger-plan.md.

-- Content-addressed evidence blobs, deduplicated by hash. The same scan output
-- backing several claims is stored once.
create table if not exists conformance_evidence (
  hash             text primary key,              -- sha-256 (hex) of the canonical blob
  type             text        not null,          -- 'scan-output' in Phase 1
  producer_version text        not null,
  blob             jsonb       not null,
  created_at       timestamptz not null default now()
);

-- One row per signed claim. APPEND-ONLY: never updated or deleted (enforced by
-- the trigger + revoked privileges below, not just by convention). `id` is the
-- content address of the assertion; `seq` gives a stable chain/append order.
create table if not exists conformance_claim (
  id            text primary key,                 -- sha-256 (hex) of the assertion content
  seq           bigint generated always as identity,
  subject_kind  text        not null check (subject_kind in ('flow','page','component')),
  subject_key   text        not null,
  criterion     text        not null,
  wcag_version  text        not null default '2.2',
  level         text        not null check (level in ('A','AA')),
  state         text        not null check (state in ('pass','fail','not-applicable','not-evaluated','human-reviewed')),
  method        text        not null check (method in ('deterministic','runtime','semantic','human')),
  confidence    real        not null check (confidence >= 0 and confidence <= 1),
  asserted_by   text        not null,
  asserted_at   timestamptz not null,
  prev_claim_id text references conformance_claim(id),
  supersedes    text references conformance_claim(id),
  evidence_hash text references conformance_evidence(hash),
  signature     text        not null,
  key_id        text        not null
);

create index if not exists conformance_claim_subject_idx
  on conformance_claim (subject_key, criterion, asserted_at desc);
create index if not exists conformance_claim_subject_seq_idx
  on conformance_claim (subject_key, seq);

-- Per-subject chain head: the latest claim id on a subject's chain. Mutable
-- (unlike the claims themselves): advanced on every append.
create table if not exists conformance_subject_head (
  subject_key   text primary key,
  head_claim_id text        not null references conformance_claim(id),
  updated_at    timestamptz not null default now()
);

-- Append-only enforcement at the DB, not just the app: block UPDATE/DELETE on the
-- claim log. A correction is a NEW claim that supersedes the old one.
create or replace function conformance_claim_append_only()
  returns trigger language plpgsql as $$
begin
  raise exception 'conformance_claim is append-only (no % allowed)', tg_op;
end;
$$;

drop trigger if exists conformance_claim_no_mutate on conformance_claim;
create trigger conformance_claim_no_mutate
  before update or delete on conformance_claim
  for each row execute function conformance_claim_append_only();

-- Belt and braces: the app's role should also lack UPDATE/DELETE on the log.
-- (Service role bypasses this; apply a scoped grant in the deploy runbook.)
-- revoke update, delete on conformance_claim from <app_role>;

-- Row-level security. The service-role key bypasses RLS (webhook sink + any
-- server-side admin reads are unaffected). These policies constrain ONLY the
-- dashboard's user-scoped client, which presents the user's Supabase Auth JWT.
alter table users enable row level security;
alter table user_installations enable row level security;
alter table installations enable row level security;
alter table repos enable row level security;
alter table scans enable row level security;
alter table violations enable row level security;
alter table subscriptions enable row level security;
alter table licenses enable row level security;
alter table audits enable row level security;
alter table criterion_verdicts enable row level security;
alter table audit_revisions enable row level security;
-- Ledger tables: RLS on with NO select policy = deny-all to the dashboard's
-- anon client. The service-role webhook sink (which writes claims) bypasses RLS.
-- A user-scoped read policy arrives with the Phase 1 read-model (deferred).
alter table conformance_evidence enable row level security;
alter table conformance_claim enable row level security;
alter table conformance_subject_head enable row level security;

-- A user sees only their own row and their own installation links.
create policy users_self_select on users
  for select using (id = auth.uid());

create policy user_installations_self_select on user_installations
  for select using (user_id = auth.uid());

-- A user sees an installation (and its repos/scans) only if they are linked to it.
create policy installations_member_select on installations
  for select using (
    installation_id in (select installation_id from user_installations where user_id = auth.uid())
  );

create policy repos_member_select on repos
  for select using (
    installation_id in (select installation_id from user_installations where user_id = auth.uid())
  );

create policy scans_member_select on scans
  for select using (
    installation_id in (select installation_id from user_installations where user_id = auth.uid())
  );

-- Violations are scoped through their scan's installation.
create policy violations_member_select on violations
  for select using (
    check_run_id in (
      select check_run_id from scans
      where installation_id in (select installation_id from user_installations where user_id = auth.uid())
    )
  );

-- A user sees a subscription only if they are linked to an installation whose
-- account matches the subscription's account.
create policy subscriptions_member_select on subscriptions
  for select using (
    account_id in (
      select account_id from installations
      where installation_id in (select installation_id from user_installations where user_id = auth.uid())
    )
  );

-- A user sees an installation's license only if they are linked to it. (Guarded
-- with a drop so re-applying this schema to an existing project is idempotent.)
drop policy if exists licenses_member_select on licenses;
create policy licenses_member_select on licenses
  for select using (
    installation_id in (select installation_id from user_installations where user_id = auth.uid())
  );

-- A user sees an audit (and its verdicts) only if they are linked to its
-- installation. Draft writes happen server-side via the service-role key, which
-- bypasses RLS, so these are select-only like every other dashboard policy.
drop policy if exists audits_member_select on audits;
create policy audits_member_select on audits
  for select using (
    installation_id in (select installation_id from user_installations where user_id = auth.uid())
  );

drop policy if exists criterion_verdicts_member_select on criterion_verdicts;
create policy criterion_verdicts_member_select on criterion_verdicts
  for select using (
    audit_id in (
      select id from audits
      where installation_id in (select installation_id from user_installations where user_id = auth.uid())
    )
  );

-- A user sees an audit's published revisions only if they are linked to its
-- installation. The PUBLIC permalink does NOT rely on this policy: it reads via
-- the service-role key (which bypasses RLS) and is gated solely by possession of
-- the unguessable public_slug. This policy only governs the dashboard history UI.
drop policy if exists audit_revisions_member_select on audit_revisions;
create policy audit_revisions_member_select on audit_revisions
  for select using (
    installation_id in (select installation_id from user_installations where user_id = auth.uid())
  );
