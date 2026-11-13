create extension if not exists pgcrypto;

create table if not exists public.program_categories (
 id uuid primary key default gen_random_uuid(),
 name varchar(120) not null,
 slug varchar(140) not null unique,
 description text,
 created_at timestamptz not null default now()
);

create table if not exists public.programs (
 id uuid primary key default gen_random_uuid(),
 category_id uuid not null references public.program_categories(id) on delete restrict,
 name varchar(160) not null,
 slug varchar(180) not null unique,
 description text,
 target_audience text,
 course_level varchar(100),
 duration varchar(100),
 total_meetings integer check (total_meetings is null or total_meetings >= 0),
 price numeric(14,2) check (price is null or price >= 0),
 learning_method varchar(40),
 image_url text,
 is_active boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists idx_programs_category_active on public.programs(category_id,is_active);

create table if not exists public.course_schedules (
 id uuid primary key default gen_random_uuid(),
 program_id uuid not null references public.programs(id) on delete cascade,
 day varchar(20) not null,
 start_time time not null,
 end_time time not null,
 learning_method varchar(40) not null,
 capacity integer check (capacity is null or capacity >= 0),
 is_active boolean not null default false,
 check (end_time > start_time)
);
create index if not exists idx_schedules_program_active on public.course_schedules(program_id,is_active);

create table if not exists public.participants (
 id uuid primary key default gen_random_uuid(),
 full_name varchar(120) not null,
 phone varchar(25) not null,
 email varchar(180),
 birth_date date,
 education_level varchar(80) not null,
 school_name varchar(160),
 guardian_name varchar(120),
 guardian_phone varchar(25),
 created_at timestamptz not null default now()
);

create table if not exists public.registrations (
 id uuid primary key default gen_random_uuid(),
 registration_code varchar(32) not null unique,
 participant_id uuid not null references public.participants(id) on delete restrict,
 program_id uuid not null references public.programs(id) on delete restrict,
 schedule_id uuid references public.course_schedules(id) on delete set null,
 status varchar(30) not null default 'new' check (status in ('new','contacted','confirmed','cancelled')),
 learning_method varchar(40) not null,
 consent_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists idx_registrations_created on public.registrations(created_at desc);
create index if not exists idx_registrations_participant on public.registrations(participant_id);

create table if not exists public.registration_logs (
 id uuid primary key default gen_random_uuid(),
 registration_id uuid not null references public.registrations(id) on delete cascade,
 status varchar(30) not null,
 notes text,
 created_at timestamptz not null default now()
);


-- Initial catalog names from the approved project brief. Records remain inactive until details are verified.
insert into program_categories(name,slug,description) values
 ('Foreign Languages','foreign-languages','Program pembelajaran bahasa asing.'),
 ('Multimedia & Digital Skills','multimedia-digital-skills','Program keterampilan komputer dan digital.'),
 ('Professional Skills','professional-skills','Program pengembangan keterampilan profesional.')
on conflict(slug) do nothing;

insert into programs(category_id,name,slug,is_active)
select c.id, p.name, p.slug, false
from (values
 ('foreign-languages','English Language','english-language'),
 ('foreign-languages','Korean Language','korean-language'),
 ('foreign-languages','Japanese Language','japanese-language'),
 ('foreign-languages','Mandarin Language','mandarin-language'),
 ('foreign-languages','Arabic Language','arabic-language'),
 ('foreign-languages','TOEFL Preparation','toefl-preparation'),
 ('multimedia-digital-skills','Computer Operator','computer-operator'),
 ('multimedia-digital-skills','Graphic Design','graphic-design'),
 ('multimedia-digital-skills','Video Editing','video-editing'),
 ('multimedia-digital-skills','Digital Marketing','digital-marketing'),
 ('multimedia-digital-skills','3D Digital Animation using Blender','3d-digital-animation-blender'),
 ('multimedia-digital-skills','AutoCAD','autocad'),
 ('professional-skills','Public Speaking','public-speaking'),
 ('professional-skills','Hospitality','hospitality')
) as p(category_slug,name,slug)
join program_categories c on c.slug=p.category_slug
on conflict(slug) do nothing;

-- Atomic yearly sequence for human-readable registration codes.
create table if not exists public.registration_counters (
 year integer primary key,
 last_value bigint not null default 0
);

create or replace function public.create_registration(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
 v_year integer := extract(year from now() at time zone 'Asia/Jakarta')::integer;
 v_number bigint;
 v_participant uuid;
 v_registration uuid;
 v_code text;
 v_program uuid := (payload->>'program_id')::uuid;
 v_schedule uuid := nullif(payload->>'schedule_id','')::uuid;
begin
 if not exists (select 1 from programs where id=v_program and is_active=true) then
   raise exception 'Program is not active';
 end if;
 if v_schedule is not null and not exists (select 1 from course_schedules where id=v_schedule and program_id=v_program and is_active=true) then
   raise exception 'Schedule is not active';
 end if;

 insert into registration_counters(year,last_value) values(v_year,1)
 on conflict(year) do update set last_value=registration_counters.last_value+1
 returning last_value into v_number;
 v_code := 'HI-REG-' || v_year::text || '-' || lpad(v_number::text,5,'0');

 insert into participants(full_name,phone,email,education_level,school_name,guardian_name,guardian_phone)
 values(payload->>'full_name',payload->>'phone',nullif(payload->>'email',''),payload->>'education_level',
 nullif(payload->>'school_name',''),nullif(payload->>'guardian_name',''),nullif(payload->>'guardian_phone',''))
 returning id into v_participant;

 insert into registrations(registration_code,participant_id,program_id,schedule_id,status,learning_method,consent_at)
 values(v_code,v_participant,v_program,v_schedule,'new',payload->>'learning_method',
 case when coalesce((payload->>'guardian_consent')::boolean,false) then now() else null end)
 returning id into v_registration;

 insert into registration_logs(registration_id,status,notes) values(v_registration,'new','Pendaftaran dibuat melalui website.');
 return jsonb_build_object('registration_code',v_code,'registration_id',v_registration);
end $$;

revoke all on function public.create_registration(jsonb) from public, anon, authenticated;
grant execute on function public.create_registration(jsonb) to service_role;

-- Lock down direct public access. Public pages read active course catalog via server service role.
alter table program_categories enable row level security;
alter table programs enable row level security;
alter table course_schedules enable row level security;
alter table participants enable row level security;
alter table registrations enable row level security;
alter table registration_logs enable row level security;
alter table registration_counters enable row level security;
