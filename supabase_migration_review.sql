-- Añadir columna de revisión para el revisor (parseada como Explanation)
alter table public.candidates
  add column if not exists review text;

comment on column public.candidates.review is 'Revisión del revisor en formato markdown (mismo parseo que Explanation)';
