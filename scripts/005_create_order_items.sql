-- Create order items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null,
  price_at_purchase decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

alter table public.order_items enable row level security;

-- Users can view items in orders they're involved with
create policy "order_items_select"
  on public.order_items for select
  using (
    auth.uid() in (
      select buyer_id from public.orders where id = order_id
      union
      select host_id from public.orders where id = order_id
    )
  );

-- Only insertion during order creation
create policy "order_items_insert"
  on public.order_items for insert
  with check (
    auth.uid() in (
      select buyer_id from public.orders where id = order_id
    )
  );
