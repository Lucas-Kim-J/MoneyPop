create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  budget numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id bigint not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  amount numeric not null,
  description text,
  category text,
  date timestamptz not null,
  is_impulse boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.subscriptions (
  id bigint not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  category text,
  next_due_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null,
  primary key (user_id, id)
);

create table if not exists public.subscription_pending (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id bigint not null,
  name text not null,
  amount numeric not null,
  category text,
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.user_settings enable row level security;
alter table public.transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_pending enable row level security;

create policy "user_settings_rw" on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_rw" on public.transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscriptions_rw" on public.subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscription_pending_rw" on public.subscription_pending
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
