-- 1. Tabla de perfiles: una fila por cada usuario de Authentication
create table public.usuario (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  correo text unique not null,
  fecha_nacimiento date,
  telefono text,
  rol text not null default 'usuario' check (rol in ('usuario', 'admin')),
  creado_en timestamptz not null default now()
);

-- 2. Tabla de imágenes de cada usuario
create table public.multimedia (
  id bigint generated always as identity primary key,
  url text not null,
  usuario_id uuid not null references public.usuario (id) on delete cascade,
  creado_en timestamptz not null default now()
);
