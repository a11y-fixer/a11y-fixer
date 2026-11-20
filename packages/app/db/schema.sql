-- a11y-fixer control plane schema (Supabase Postgres).
--
-- M1 ships the installation lifecycle tables (installations, repos) and the
-- webhook_events idempotency ledger. M2 adds scans/violations (below); users and
-- M3 subscriptions come later. Row-level security per org is enabled with the
-- dashboard auth model; until then only the service-role key (server-side)
-- touches these.

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
