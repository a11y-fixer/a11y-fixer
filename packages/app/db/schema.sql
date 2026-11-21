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
