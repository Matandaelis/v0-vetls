-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  show_id uuid references public.shows(id) on delete set null,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  stock integer default 0,
  category text,
  images text[] default array[]::text[],
  rating decimal(3, 2) default 0,
  reviews integer default 0,
  featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.products enable row level security;

-- Everyone can view products
create policy "products_select_all"
  on public.products for select
  using (true);

-- Only host can create products
create policy "products_insert_own"
  on public.products for insert
  with check (auth.uid() = host_id);

-- Only host can update their products
create policy "products_update_own"
  on public.products for update
  using (auth.uid() = host_id);

-- Only host can delete their products
create policy "products_delete_own"
  on public.products for delete
  using (auth.uid() = host_id);
