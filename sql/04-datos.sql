-- Volver admin a un usuario (solo se puede desde Supabase)
update public.usuario set rol = 'admin', nombre = 'Admin Prueba'
where correo = 'admin@prueba.com';

-- Completar datos de los otros dos
update public.usuario set nombre = 'Ana Rojas', telefono = '3109876543',
  fecha_nacimiento = '2003-04-02'
where correo = 'ana@prueba.com';

update public.usuario set nombre = 'Luis Gómez', telefono = '3205550101',
  fecha_nacimiento = '2002-11-20'
where correo = 'luis@prueba.com';

-- Imágenes de ejemplo
insert into public.multimedia (url, usuario_id)
select 'https://picsum.photos/id/' || n || '/400/400', u.id
from public.usuario u
join (values ('admin@prueba.com', 10), ('ana@prueba.com', 20),
             ('ana@prueba.com', 28), ('ana@prueba.com', 29),
             ('luis@prueba.com', 37), ('luis@prueba.com', 42)) as d(correo, n)
  on d.correo = u.correo;
