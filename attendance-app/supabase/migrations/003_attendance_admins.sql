create table if not exists public.attendance_admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_attendance_admins_active on public.attendance_admins(is_active);
alter table public.attendance_admins enable row level security;
revoke all on public.attendance_admins from anon, authenticated;
grant all on public.attendance_admins to service_role;
