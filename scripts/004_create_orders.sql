-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  host_id uuid not null references public.profiles(id) on delete cascade,
  show_id uuid references public.shows(id) on delete set null,
  status text default 'pending', -- pending, completed, cancelled
  total_amount decimal(10, 2) not null,
  stripe_payment_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

-- Buyers can view their own orders
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = buyer_id);

-- Hosts can view their received orders
create policy "orders_select_host"
  on public.orders for select
  using (auth.uid() = host_id);

-- Only buyer can create orders
create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

-- Only buyer can update their orders
create policy "orders_update_own"
  on public.orders for update
  using (auth.uid() = buyer_id);
