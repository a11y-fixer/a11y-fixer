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

-- One ingested a11y-fixer scan per completed Check Run (scan_id = check_run.id).
-- NB: installation_id/repo_id are plain columns, NOT foreign keys. A `check_run`
-- delivery can race ahead of its installation/repo rows (or arrive under GitHub's
-- "all repositories" selection, where repos aren't enumerated), and because the
-- idempotency ledger records a delivery before routing, a throwing FK insert would
-- lose the scan on retry. Dashboard queries left-join these instead.
create table if not exists scans (
  scan_id         bigint primary key,
  installation_id bigint,
  repo_id         bigint not null,
  full_name       text   not null,
  sha             text   not null,
  pr_number       integer,
  mode            text   not null,
  conclusion      text   not null,
  critical        integer not null default 0,
  serious         integer not null default 0,
  moderate        integer not null default 0,
  minor           integer not null default 0,
  total           integer not null default 0,
  truncated       boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists scans_repo_id_idx on scans (repo_id);

-- Per-violation rows for a scan. Replaced wholesale on a redelivered completion
-- (the handler deletes by scan_id then re-inserts), so the ON DELETE CASCADE here
-- also cleans them up when a scan row is removed.
create table if not exists violations (
  id          bigint generated always as identity primary key,
  scan_id     bigint not null references scans(scan_id) on delete cascade,
  rule_id     text   not null,
  wcag_id     text   not null,
  impact      text   not null,
  description text   not null,
  help_url    text   not null,
  path        text,
  line        integer
);

create index if not exists violations_scan_id_idx on violations (scan_id);
