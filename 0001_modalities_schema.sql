-- Modalities and Protocols Schema Migration

-- Create modalities table
create table public.modalities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text, -- e.g., 'supplement', 'behavioral', 'environmental'
  default_instructions text,
  metadata jsonb -- For evidence, contraindications, future KG links
);

-- Create protocols table
create table public.protocols (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  is_recommended boolean default false,
  is_public boolean default false
);

-- Create protocol_modalities bridge
create table public.protocol_modalities (
  protocol_id uuid references public.protocols on delete cascade,
  modality_id uuid references public.modalities on delete cascade,
  primary key (protocol_id, modality_id)
);

-- Create user_protocols table
create table public.user_protocols (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  start_date date not null,
  baseline_days integer not null default 7,
  active_modalities jsonb not null, -- Stores snapshot of Modality items
  estimates jsonb,
  reminders jsonb,
  mode text, -- 'quick' or 'advanced'
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add relations to daily_logs
alter table public.daily_logs add column user_protocol_id uuid references public.user_protocols on delete cascade;
alter table public.daily_logs add column adherence jsonb;

-- Setup RLS
alter table public.modalities enable row level security;
alter table public.protocols enable row level security;
alter table public.protocol_modalities enable row level security;
alter table public.user_protocols enable row level security;

-- Everyone can read modalities and protocols
create policy "Anyone can view modalities" on public.modalities for select using (true);
create policy "Anyone can view protocols" on public.protocols for select using (true);
create policy "Anyone can view protocol_modalities" on public.protocol_modalities for select using (true);

-- User_protocols policies
create policy "Users can view own protocols" on public.user_protocols
  for select using (auth.uid() = user_id);

create policy "Users can insert own protocols" on public.user_protocols
  for insert with check (auth.uid() = user_id);

create policy "Users can update own protocols" on public.user_protocols
  for update using (auth.uid() = user_id);
