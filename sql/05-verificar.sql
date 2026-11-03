-- Verificar: cada usuario con su número de imágenes
select u.nombre, u.rol, count(m.id) as imagenes
from public.usuario u
left join public.multimedia m on m.usuario_id = u.id
group by u.id
order by imagenes desc;
