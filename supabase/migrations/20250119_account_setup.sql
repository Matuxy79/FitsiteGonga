-- PROFILES -----------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  gender text check (gender in ('male','female','nonbinary','prefer_not')),
  birthdate date,
  unit_system text not null default 'metric' check (unit_system in ('metric','imperial')),
  activity_level text check (activity_level in ('sedentary','light','moderate','active','athlete')),
  season text not null default 'reset' check (season in ('reset','build','challenge')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now(); return new;
end $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_profiles_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles_upsert_own"
  on public.profiles for insert with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- FITNESS METRICS (latest snapshot) ---------------------------------
create table if not exists public.fitness_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  weight_kg numeric(6,2),   -- allow null until provided
  height_cm numeric(5,2),
  body_fat_percent numeric(4,1),
  resting_hr integer,
  max_hr integer,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.fitness_metrics enable row level security;

create policy "metrics_select_own"
  on public.fitness_metrics for select using (auth.uid() = user_id);

create policy "metrics_upsert_own"
  on public.fitness_metrics for insert with check (auth.uid() = user_id);

create policy "metrics_update_own"
  on public.fitness_metrics for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MEASUREMENT HISTORY (time-series) ---------------------------------
create table if not exists public.measurement_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  measure_date date not null default (now()::date),
  weight_kg numeric(6,2),
  body_fat_percent numeric(4,1),
  waist_cm numeric(5,2),
  hips_cm numeric(5,2),
  chest_cm numeric(5,2),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_measurements_user_date
  on public.measurement_history (user_id, measure_date desc);

alter table public.measurement_history enable row level security;

create policy "meas_select_own"
  on public.measurement_history for select using (auth.uid() = user_id);
create policy "meas_insert_own"
  on public.measurement_history for insert with check (auth.uid() = user_id);

-- VIEW: computed BMI + BMR (Mifflin-St Jeor) ------------------------
create or replace view public.v_user_metrics as
select
  p.id as user_id,
  fm.weight_kg,
  fm.height_cm,
  round(
    case when fm.weight_kg is not null and fm.height_cm is not null
      then fm.weight_kg / ((fm.height_cm/100.0)^2) end
    , 1) as bmi,
  case
    when p.birthdate is null or fm.weight_kg is null or fm.height_cm is null then null
    else
      -- age in years
      (case p.gender
         when 'male' then (10*fm.weight_kg + 6.25*fm.height_cm - 5*extract(year from age(now(), p.birthdate)) + 5)
         when 'female' then (10*fm.weight_kg + 6.25*fm.height_cm - 5*extract(year from age(now(), p.birthdate)) - 161)
         else (10*fm.weight_kg + 6.25*fm.height_cm - 5*extract(year from age(now(), p.birthdate)))
       end)
  end as bmr,
  fm.resting_hr,
  fm.max_hr,
  fm.updated_at
from public.profiles p
left join public.fitness_metrics fm on fm.user_id = p.id;

-- STORAGE: avatars bucket -------------------------------------------
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
on conflict (id) do nothing;

-- public read, owner write
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and auth.uid() = owner);

create policy "avatars_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and auth.uid() = owner);

create policy "avatars_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and auth.uid() = owner);
