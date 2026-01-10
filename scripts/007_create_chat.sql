-- Create chat messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamp with time zone default now()
);

alter table public.chat_messages enable row level security;

-- Everyone can view chat for a show
create policy "chat_messages_select"
  on public.chat_messages for select
  using (true);

-- Only authenticated users can insert messages
create policy "chat_messages_insert"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- Only message author can delete
create policy "chat_messages_delete"
  on public.chat_messages for delete
  using (auth.uid() = user_id);
