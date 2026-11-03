-- ¿El usuario que hace la consulta es admin?
create function public.es_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuario
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- Activar RLS: sin políticas, nadie puede leer ni escribir
alter table public.usuario enable row level security;
alter table public.multimedia enable row level security;

-- USUARIO: cada quien ve y edita lo suyo; el admin ve y edita todo
create policy "ver perfil propio o admin" on public.usuario
  for select to authenticated
  using (id = auth.uid() or public.es_admin());

create policy "editar perfil propio o admin" on public.usuario
  for update to authenticated
  using (id = auth.uid() or public.es_admin());

-- Nadie puede cambiarse el rol desde la app: solo un admin o el panel de Supabase
create function public.proteger_rol()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- auth.uid() es null cuando editas desde el panel de Supabase
  if new.rol <> old.rol and auth.uid() is not null and not public.es_admin() then
    raise exception 'Solo un admin puede cambiar el rol';
  end if;
  return new;
end;
$$;

create trigger antes_de_editar_usuario
  before update on public.usuario
  for each row execute function public.proteger_rol();

-- MULTIMEDIA: cada quien ve, agrega y borra sus imágenes; el admin todo
create policy "ver imagenes propias o admin" on public.multimedia
  for select to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

create policy "agregar imagenes propias" on public.multimedia
  for insert to authenticated
  with check (usuario_id = auth.uid());

create policy "borrar imagenes propias o admin" on public.multimedia
  for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());
