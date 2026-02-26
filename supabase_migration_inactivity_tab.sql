-- Añadir columnas para detectar posible uso de IA / inactividad
-- Ejecutar en Supabase SQL Editor si la tabla candidates ya existe

alter table public.candidates
  add column if not exists inactivity_seconds integer default 0,
  add column if not exists tab_switches integer default 0;

comment on column public.candidates.inactivity_seconds is 'Segundos acumulados sin movimiento de teclado ni ratón (umbral 1 minuto)';
comment on column public.candidates.tab_switches is 'Veces que el candidato cambió de pestaña o perdió el foco de la ventana';
