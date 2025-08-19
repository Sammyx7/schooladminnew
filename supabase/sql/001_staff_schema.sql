-- Staff core table with all onboarding fields
create table if not exists public.staff (
  id bigserial primary key,
  staff_id text not null unique,
  name text not null,
  role text not null,
  department text not null,
  email text not null unique,
  phone text null,
  joining_date timestamptz null,
  qualifications text[] default '{}',
  avatar_url text null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_staff_id_idx on public.staff (staff_id);
create index if not exists staff_email_idx on public.staff (email);

-- Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists staff_set_updated_at on public.staff;
create trigger staff_set_updated_at
before update on public.staff
for each row execute function public.set_updated_at();

-- Teaching assignments table
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

-- Enforce one class-teacher per class/section (optional, safe unique partial index)
create unique index if not exists uniq_class_teacher_per_class
on public.staff_class_assignments (class_name, section)
where is_class_teacher = true;

-- Enable RLS
alter table public.staff enable row level security;
alter table public.staff_class_assignments enable row level security;

-- Helper to extract JWT as JSON (Supabase provides auth.jwt())
-- Policies: staff can read own row by email or by email prefix matching staff_id
drop policy if exists staff_read_own on public.staff;
create policy staff_read_own
on public.staff for select
using (
  (auth.jwt() ->> 'email') is not null and (
    (auth.jwt() ->> 'email') = email or split_part((auth.jwt() ->> 'email'), '@', 1) = staff_id
  )
);

-- Note: Service role bypasses RLS automatically; no policy needed for it.

-- Assignments: readable if the authenticated user can read the linked staff row
drop policy if exists assignments_read_own on public.staff_class_assignments;
create policy assignments_read_own
on public.staff_class_assignments for select
using (
  exists (
    select 1 from public.staff s
    where s.staff_id = staff_class_assignments.staff_id
      and (
        (auth.jwt() ->> 'email') = s.email or split_part((auth.jwt() ->> 'email'), '@', 1) = s.staff_id
      )
  )
);

-- Note: Service role bypasses RLS automatically for assignments as well.
