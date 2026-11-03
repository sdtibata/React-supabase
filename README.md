# Dashboard con React + Supabase

App de ejemplo para la guía de laboratorio: registro, inicio de sesión, perfil con imágenes y un dashboard de administración protegido con RLS. Se convierte en APK de Android con Capacitor, sin Android Studio.

**Stack:** React + Vite · Supabase (Auth + PostgreSQL + RLS) · Bootstrap 5 · Capacitor

## 1. Base de datos

En el **SQL Editor** de tu proyecto de Supabase, ejecuta en orden los archivos de la carpeta [`sql/`](sql):

| Archivo | Qué hace |
|---|---|
| `01-tablas.sql` | Tablas `usuario` y `multimedia` |
| `02-trigger.sql` | Crea el perfil automáticamente al registrarse |
| `03-rls.sql` | Políticas de seguridad (RLS) |
| `04-datos.sql` | Datos de prueba (cambia los correos por los de tus usuarios) |
| `05-verificar.sql` | Comprueba que todo quedó bien |

## 2. Correr la app en Codespaces

1. Botón verde **Code → Codespaces → Create codespace on main**.
2. Copia `.env.example` como `.env` y pega tu URL y tu clave publicable (Supabase → **Connect** → React → Vite).
3. En la terminal:

```bash
npm install
npm run dev
```

## 3. Generar el APK

El workflow [`.github/workflows/apk.yml`](.github/workflows/apk.yml) compila el APK en los servidores de GitHub.

1. En tu repo: **Settings → Secrets and variables → Actions → New repository secret**. Crea `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con los mismos valores del `.env`.
2. Pestaña **Actions → Compilar APK → Run workflow**.
3. Cuando termine (unos 5 minutos), abre la ejecución y descarga **app-debug** en *Artifacts*. Adentro está `app-debug.apk`.

El ícono y la pantalla de carga salen de la carpeta [`assets/`](assets). Reemplaza esas imágenes por las tuyas con los mismos nombres y tamaños.

## Estructura

```
sql/                  scripts para el SQL Editor de Supabase
src/
├── main.jsx          carga Bootstrap
├── App.jsx           rutas y sesión
├── supabase.js       conexión con Supabase
└── componentes/      login, registro, perfil, dashboard
assets/               ícono y splash del APK
capacitor.config.json nombre e id de la app Android
```

> El archivo `.env` nunca se sube a GitHub. En el frontend solo va la clave **publicable**; la secreta nunca.
