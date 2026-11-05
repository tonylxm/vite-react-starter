-- Example table: each user sees and changes only their own notes.
create table public.notes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index notes_user_id_idx on public.notes (user_id);

alter table public.notes enable row level security;

-- Signed-out visitors (anon) get no grants at all.
revoke all on public.notes from anon, authenticated;
grant select, insert, update, delete on public.notes to authenticated;

-- (select auth.uid()) is evaluated once per query instead of once per row.
create policy "Users read their own notes" on public.notes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add their own notes" on public.notes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users edit their own notes" on public.notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own notes" on public.notes
  for delete to authenticated
  using ((select auth.uid()) = user_id);
