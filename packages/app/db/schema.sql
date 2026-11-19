-- a11y-fixer control plane schema (Supabase Postgres).
--
-- M1 ships the installation lifecycle tables (installations, repos) and the
-- webhook_events idempotency ledger. M2 adds scans/violations/users; M3 adds
-- subscriptions. Row-level security per org is enabled in M2 with the dashboard
-- auth model; until then only the service-role key (server-side) touches these.

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
-- violation_count mirrors output.annotations_count; detailed per-rule rows go in
-- `violations` once annotation-fetch lands (the webhook carries only the count).
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

-- M2: optional per-violation detail (populated from Check Run annotations in a
-- follow-up; the dashboard works off scans.violation_count without it).
create table if not exists violations (
  id           bigint generated always as identity primary key,
  check_run_id bigint not null references scans(check_run_id) on delete cascade,
  wcag_id      text,
  description  text,
  path         text,
  start_line   integer,
  level        text
);

create index if not exists violations_check_run_id_idx on violations (check_run_id);
