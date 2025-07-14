create extension if not exists "pgcrypto";
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default current_timestamp
);
alter table public.users enable row level security;
create policy "Users can insert themselves"
  on public.users for insert with check (true);
create policy "User selects own row"
  on public.users for select using (id = auth.uid());
create unique index users_email_idx on public.users(email);