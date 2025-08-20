-- Safe alters in case the tables already exist with fewer columns
alter table if exists public.staff
  add column if not exists phone text,
  add column if not exists joining_date timestamptz,
  add column if not exists qualifications text[] default '{}'::text[],
  add column if not exists avatar_url text,
  add column if not exists inserted_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Ensure basic not nulls/uniques
alter table if exists public.staff
  alter column staff_id set not null,
  alter column name set not null,
  alter column role set not null,
  alter column department set not null,
  alter column email set not null;

create unique index if not exists staff_staff_id_key on public.staff (staff_id);
create unique index if not exists staff_email_key on public.staff (email);
create index if not exists staff_staff_id_idx on public.staff (staff_id);
create index if not exists staff_email_idx on public.staff (email);

-- Create assignments table if missing
create table if not exists public.staff_class_assignments (
  id bigserial primary key,
  staff_id text not null references public.staff(staff_id) on delete cascade,
  class_name text not null,
  section text not null,
  subject text null,
  is_class_teacher boolean not null default false,
  inserted_at timestamptz not null default now()
);

create index if not exists staff_class_assignments_staff_idx on public.staff_class_assignments(staff_id);
create index if not exists staff_class_assignments_class_idx on public.staff_class_assignments(class_name, section);
create unique index if not exists uniq_class_teacher_per_class on public.staff_class_assignments (class_name, section) where is_class_teacher = true;

-- RLS enable and policies
alter table if exists public.staff enable row level security;
alter table if exists public.staff_class_assignments enable row level security;

drop policy if exists staff_read_own on public.staff;
create policy staff_read_own on public.staff for select using (
  (auth.jwt() ->> 'email') is not null and ((auth.jwt() ->> 'email') = email or split_part((auth.jwt() ->> 'email'), '@', 1) = staff_id)
);
-- Note: Service role bypasses RLS automatically; no explicit policy needed.

drop policy if exists assignments_read_own on public.staff_class_assignments;
create policy assignments_read_own on public.staff_class_assignments for select using (
  exists (select 1 from public.staff s where s.staff_id = staff_class_assignments.staff_id and ((auth.jwt() ->> 'email') = s.email or split_part((auth.jwt() ->> 'email'), '@', 1) = s.staff_id))
);
-- Note: Service role bypasses RLS for assignments as well.

-- Staff attendance table
create table if not exists public.staff_attendance (
  id bigserial primary key,
  staff_id text not null references public.staff(staff_id) on delete cascade,
  date timestamptz not null default now(),
  status text not null check (status in ('Present','Absent','Late','Excused')),
  inserted_at timestamptz not null default now()
);

-- Add day column for efficient per-day constraints/queries
alter table if exists public.staff_attendance
  add column if not exists day date not null default ((now() at time zone 'UTC')::date);

-- Keep day in sync with date via trigger
create or replace function public.set_staff_attendance_day()
returns trigger as $$
begin
  new.day := (new.date at time zone 'UTC')::date;
  return new;
end;
$$ language plpgsql;

drop trigger if exists staff_attendance_set_day on public.staff_attendance;
create trigger staff_attendance_set_day
before insert or update of date on public.staff_attendance
for each row execute function public.set_staff_attendance_day();

-- Unique per staff per calendar day
create unique index if not exists uniq_staff_attendance_per_day
on public.staff_attendance (staff_id, day);

create index if not exists staff_attendance_staff_idx on public.staff_attendance(staff_id);
create index if not exists staff_attendance_date_idx on public.staff_attendance(date);

-- Enable RLS and policies
alter table if exists public.staff_attendance enable row level security;

drop policy if exists staff_attendance_read_all on public.staff_attendance;
create policy staff_attendance_read_all
on public.staff_attendance for select
to authenticated
using (true);

-- Note: Inserts/updates/deletes are handled via service role API; no public write policies

-- Realtime: ensure changes are captured and broadcast
alter table if exists public.staff_attendance replica identity full;
alter publication supabase_realtime add table public.staff_attendance;
