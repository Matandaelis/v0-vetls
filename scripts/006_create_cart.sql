-- Create shopping cart table
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_id uuid references public.shows(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, show_id)
);

alter table public.carts enable row level security;

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamp with time zone default now(),
  unique(cart_id, product_id)
);

alter table public.cart_items enable row level security;

-- Cart RLS
create policy "carts_select_own"
  on public.carts for select
  using (auth.uid() = user_id);

create policy "carts_insert_own"
  on public.carts for insert
  with check (auth.uid() = user_id);

create policy "carts_update_own"
  on public.carts for update
  using (auth.uid() = user_id);

create policy "carts_delete_own"
  on public.carts for delete
  using (auth.uid() = user_id);

-- Cart items RLS
create policy "cart_items_select"
  on public.cart_items for select
  using (
    auth.uid() in (
      select user_id from public.carts where id = cart_id
    )
  );

create policy "cart_items_insert"
  on public.cart_items for insert
  with check (
    auth.uid() in (
      select user_id from public.carts where id = cart_id
    )
  );

create policy "cart_items_update"
  on public.cart_items for update
  using (
    auth.uid() in (
      select user_id from public.carts where id = cart_id
    )
  );

create policy "cart_items_delete"
  on public.cart_items for delete
  using (
    auth.uid() in (
      select user_id from public.carts where id = cart_id
    )
  );
