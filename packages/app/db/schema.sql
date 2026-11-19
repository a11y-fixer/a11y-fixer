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
