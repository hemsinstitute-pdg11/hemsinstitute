create table if not exists public.attendance_teachers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  teacher_code text not null unique,
  full_name text not null,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_teachers_code_format check (teacher_code ~ '^[A-Za-z0-9_-]{3,30}$')
);
create table if not exists public.attendance_settings (
  id smallint primary key default 1 check (id = 1),
  institution_name text not null default 'Hem''s Institute',
  address text not null default 'Hem''s Institute, Padang, Sumatera Barat',
  latitude double precision,
  longitude double precision,
  radius_m integer not null default 50 check (radius_m between 10 and 500),
  location_verified boolean not null default false,
  timezone text not null default 'Asia/Jakarta',
  updated_at timestamptz not null default now(),
  constraint attendance_settings_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint attendance_settings_longitude_range check (longitude is null or longitude between -180 and 180)
);
insert into public.attendance_settings (id, institution_name, address, radius_m, location_verified)
values (1, 'Hem''s Institute', 'Hem''s Institute, Padang, Sumatera Barat', 50, false)
on conflict (id) do nothing;
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.attendance_teachers(id) on delete restrict,
  work_date date not null,
  check_in_at timestamptz,
  check_in_latitude double precision,
  check_in_longitude double precision,
  check_in_accuracy_m double precision,
  check_in_distance_m double precision,
  check_out_at timestamptz,
  check_out_latitude double precision,
  check_out_longitude double precision,
  check_out_accuracy_m double precision,
  check_out_distance_m double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, work_date),
  constraint attendance_checkin_latitude_range check (check_in_latitude is null or check_in_latitude between -90 and 90),
  constraint attendance_checkin_longitude_range check (check_in_longitude is null or check_in_longitude between -180 and 180),
  constraint attendance_checkout_latitude_range check (check_out_latitude is null or check_out_latitude between -90 and 90),
  constraint attendance_checkout_longitude_range check (check_out_longitude is null or check_out_longitude between -180 and 180),
  constraint attendance_checkout_requires_checkin check (check_out_at is null or check_in_at is not null),
  constraint attendance_checkout_after_checkin check (check_out_at is null or check_out_at >= check_in_at)
);
create index if not exists idx_attendance_records_work_date on public.attendance_records(work_date desc);
create index if not exists idx_attendance_records_teacher_date on public.attendance_records(teacher_id, work_date desc);
create index if not exists idx_attendance_teachers_active on public.attendance_teachers(is_active, full_name);
alter table public.attendance_teachers enable row level security;
alter table public.attendance_settings enable row level security;
alter table public.attendance_records enable row level security;
revoke all on public.attendance_teachers, public.attendance_settings, public.attendance_records from anon, authenticated;
grant usage on schema public to service_role;
grant all on public.attendance_teachers, public.attendance_settings, public.attendance_records to service_role;
