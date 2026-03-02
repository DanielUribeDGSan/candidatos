-- Crea la tabla de candidatos
create table public.candidates (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  track text not null,
  completed boolean default false,
  start_time timestamp with time zone default timezone('utc'::text, now()),
  end_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  inactivity_seconds integer default 0,
  tab_switches integer default 0,
  review text,
  unique (email, track)
);

-- Crea la tabla de tareas/resultados completados
create table public.candidate_results (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid references public.candidates(id) on delete cascade,
  email text not null,
  track text not null,
  test_id text not null,
  code text,
  passed boolean default false,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  unique (email, track, test_id)
);

-- Configura RLS (Row Level Security) para permitir que la app cliente inserte datos
alter table public.candidates enable row level security;
alter table public.candidate_results enable row level security;

-- Crea las politicas para insercion anonima (ya que no hay login formal)
create policy "Allow anonymous inserts to candidates" 
  on public.candidates for insert 
  with check (true);

create policy "Allow anonymous selects on candidates" 
  on public.candidates for select 
  using (true);

create policy "Allow anonymous updates to candidates" 
  on public.candidates for update 
  using (true);

create policy "Allow anonymous inserts to candidate_results" 
  on public.candidate_results for insert 
  with check (true);

create policy "Allow anonymous selects on candidate_results" 
  on public.candidate_results for select 
  using (true);
