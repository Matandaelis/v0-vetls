-- Create shows/streams table
create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  thumbnail text,
  status text default 'scheduled', -- scheduled, live, ended
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  category text,
  room_name text unique not null,
  viewer_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.shows enable row level security;

-- Hosts can view all shows
create policy "shows_select_all"
  on public.shows for select
  using (true);

-- Only host can create their own shows
create policy "shows_insert_own"
  on public.shows for insert
  with check (auth.uid() = host_id);

-- Only host can update their own shows
create policy "shows_update_own"
  on public.shows for update
  using (auth.uid() = host_id);

-- Only host can delete their own shows
create policy "shows_delete_own"
  on public.shows for delete
  using (auth.uid() = host_id);
