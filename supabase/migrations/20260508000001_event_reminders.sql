-- Event reminders table — stores user-set reminders for push notifications
create table if not exists public.event_reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  remind_at timestamptz not null,
  sent boolean default false,
  created_at timestamptz default now(),
  unique(user_id, event_id)
);

-- RLS
alter table public.event_reminders enable row level security;

create policy "Users can manage their own reminders"
  on public.event_reminders
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can read all (for cron function)
create policy "Service role can read all reminders"
  on public.event_reminders
  for select
  using (true);
