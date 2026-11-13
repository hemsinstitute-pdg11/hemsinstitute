create index if not exists idx_registration_logs_registration_id on public.registration_logs(registration_id);
create index if not exists idx_registrations_program_id on public.registrations(program_id);
create index if not exists idx_registrations_schedule_id on public.registrations(schedule_id);
