-- Cuando alguien se registra, Supabase crea su fila en auth.users.
-- Este trigger copia sus datos a public.usuario automáticamente.
create function public.crear_perfil()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.usuario (id, nombre, correo, fecha_nacimiento, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'fecha_nacimiento', '')::date,
    new.raw_user_meta_data ->> 'telefono'
  );
  return new;
end;
$$;

create trigger al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil();
