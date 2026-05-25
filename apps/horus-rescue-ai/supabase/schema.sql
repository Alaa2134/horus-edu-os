-- ===================================================================
-- Horus Rescue AI — Supabase schema
-- -------------------------------------------------------------------
-- Mirrors the TypeScript interfaces in src/types/index.ts.
-- The app runs fully offline without this; apply it only when you want
-- real persistence + realtime. Run in the Supabase SQL editor.
-- ===================================================================

-- Enums --------------------------------------------------------------

create type priority_level   as enum ('Low', 'Medium', 'High', 'Critical');
create type report_source     as enum ('Manual', 'Camera AI', 'IR Checkpoint', 'AI+IR Fusion');
create type report_status     as enum ('New', 'Assigned', 'En Route', 'On Scene', 'Resolved');
create type device_status     as enum ('Online', 'Offline');
create type ir_status         as enum ('Idle', 'Triggered');
create type toggle_status     as enum ('On', 'Off');
create type team_type         as enum ('Rescue', 'Medical', 'Fire', 'Security');
create type team_status       as enum ('Available', 'Assigned', 'En Route', 'On Scene', 'Returning');
create type timeline_type     as enum ('report', 'ir', 'camera', 'fusion', 'team', 'system');
create type timeline_severity as enum ('info', 'success', 'warning', 'critical');

-- Camera devices -----------------------------------------------------

create table camera_devices (
  id                  text primary key,
  location            text not null,
  status              device_status not null default 'Online',
  person_detected     boolean not null default false,
  people_count        int not null default 0,
  confidence          numeric(4,3) not null default 0,    -- 0..1
  danger_zone_active  boolean not null default false,
  linked_checkpoint_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Checkpoint devices (ESP32 + IR) ------------------------------------

create table checkpoint_devices (
  id                text primary key,
  location          text not null,
  status            device_status not null default 'Online',
  ir_status         ir_status not null default 'Idle',
  crossings_today   int not null default 0,
  last_triggered    timestamptz,
  linked_camera_id  text references camera_devices(id) on delete set null,
  buzzer_status     toggle_status not null default 'Off',
  led_status        toggle_status not null default 'Off',
  risk_contribution int not null default 0,
  battery           int not null default 100,
  power_source      text not null default 'USB',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- back-reference for camera -> checkpoint
alter table camera_devices
  add constraint camera_linked_checkpoint_fk
  foreign key (linked_checkpoint_id)
  references checkpoint_devices(id) on delete set null;

-- Rescue teams -------------------------------------------------------

create table rescue_teams (
  id                 text primary key,
  name               text not null,
  type               team_type not null,
  status             team_status not null default 'Available',
  assigned_report_id text,
  created_at         timestamptz not null default now()
);

-- Emergency reports --------------------------------------------------

create table emergency_reports (
  id              text primary key,
  type            text not null,
  source          report_source not null,
  location        text not null,
  description     text not null default '',
  risk_score      int not null check (risk_score between 0 and 100),
  priority        priority_level not null,
  status          report_status not null default 'New',
  created_at      timestamptz not null default now(),
  assigned_team   text,
  ai_explanation  text not null default '',
  recommendation  text not null default '',
  camera_evidence jsonb,      -- { cameraId, peopleCount, confidence, dangerZone, snapshotLabel }
  ir_evidence     jsonb,      -- { deviceId, crossings, repeated, lastTriggered }
  affected_people int default 0,
  trapped         boolean default false,
  medical_needed  boolean default false
);

alter table rescue_teams
  add constraint team_assigned_report_fk
  foreign key (assigned_report_id)
  references emergency_reports(id) on delete set null;

create index idx_reports_priority on emergency_reports(priority);
create index idx_reports_status   on emergency_reports(status);
create index idx_reports_created   on emergency_reports(created_at desc);

-- Timeline events ----------------------------------------------------

create table timeline_events (
  id          uuid primary key default gen_random_uuid(),
  timestamp   timestamptz not null default now(),
  type        timeline_type not null,
  title       text not null,
  description text not null default '',
  severity    timeline_severity not null default 'info'
);

create index idx_timeline_time on timeline_events(timestamp desc);

-- Simulation runs ----------------------------------------------------

create table simulation_runs (
  id                uuid primary key default gen_random_uuid(),
  started_at        timestamptz not null default now(),
  scenario          text not null,
  reports_generated int not null default 0,
  critical_count    int not null default 0
);

-- ===================================================================
-- Row Level Security (RLS)
-- -------------------------------------------------------------------
-- Enable RLS on every table. For a public demo dashboard, allow read
-- to everyone and writes to authenticated users. Tighten per your org
-- (e.g. restrict writes to a 'dispatcher' role via a claims check).
-- ===================================================================

alter table camera_devices     enable row level security;
alter table checkpoint_devices enable row level security;
alter table rescue_teams        enable row level security;
alter table emergency_reports  enable row level security;
alter table timeline_events     enable row level security;
alter table simulation_runs     enable row level security;

-- Public read policies (demo). Replace `true` with role checks in prod.
create policy "public read cameras"     on camera_devices     for select using (true);
create policy "public read checkpoints" on checkpoint_devices for select using (true);
create policy "public read teams"        on rescue_teams        for select using (true);
create policy "public read reports"     on emergency_reports  for select using (true);
create policy "public read timeline"     on timeline_events     for select using (true);
create policy "public read sims"         on simulation_runs     for select using (true);

-- Authenticated write policies. ESP32 devices should use a service key
-- or a dedicated device JWT rather than the anon key.
create policy "auth write cameras"     on camera_devices     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write checkpoints" on checkpoint_devices for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write teams"        on rescue_teams        for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write reports"     on emergency_reports  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write timeline"     on timeline_events     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write sims"         on simulation_runs     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Enable realtime (optional): add tables to the supabase_realtime publication.
-- alter publication supabase_realtime add table emergency_reports, timeline_events,
--   checkpoint_devices, camera_devices, rescue_teams;
