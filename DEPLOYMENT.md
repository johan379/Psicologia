# Despliegue

Backend en **Render**, frontend en **Vercel**, base de datos en **Supabase**
(Postgres). El backend acepta MySQL o Postgres sin cambiar código — solo
cambia `DATABASE_URL` (ver `app/core/config.py`).

## 1. Base de datos en Supabase

1. Crea el proyecto en [supabase.com](https://supabase.com). Guarda la
   contraseña de base de datos que elijas — no se puede recuperar después,
   solo restablecer.
2. En el proyecto: **Connect** → copia la cadena de conexión. Para un
   backend persistente (como Render) usa la conexión directa o el
   **Session pooler**; para hosting serverless, el **Transaction pooler**.
3. Queda con esta forma (ajusta el driver a `postgresql+psycopg2`, que es
   el que usa SQLAlchemy):

   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:TU_CONTRASENA@HOST:PUERTO/postgres?sslmode=require
   ```

## 2. Backend en Render

1. New → Web Service → conecta el repositorio.
2. **Root Directory**: `backend`. Render detecta el `Dockerfile` solo.
3. Variables de entorno (Environment):

   ```env
   ENTORNO=produccion
   DATABASE_URL=postgresql+psycopg2://...   # de Supabase, paso 1
   SECRET_KEY=una-clave-larga-y-aleatoria-real
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=480
   ORIGENES_PERMITIDOS=https://tu-app.vercel.app
   URL_BACKEND=https://tu-backend.onrender.com
   ```

4. **Health Check Path**: `/health`.
5. Tras el primer deploy (y después de cada migración nueva), corre una vez
   desde la pestaña **Shell** de Render:

   ```text
   alembic upgrade head
   ```

6. Crea el primer SUPERADMIN desde esa misma Shell (nunca hay endpoint HTTP
   para esto, a propósito):

   ```text
   SUPERADMIN_CORREO=admin@tudominio.com SUPERADMIN_CONTRASENA=una-clave-real \
       python -m scripts.crear_superadmin
   ```

## 3. Frontend en Vercel

1. New Project → importa el repositorio. **Root Directory**: la raíz del
   proyecto (donde está `package.json`, no `backend/`).
2. Framework preset: Vite. Build command `npm run build`, output `dist`
   (Vercel los detecta solo).
3. Variable de entorno:

   ```env
   VITE_API_URL=https://tu-backend.onrender.com
   ```

4. `vercel.json` ya está en la raíz — hace que las rutas de React Router
   (`/pacientes`, `/pacientes/123`, etc.) funcionen al recargar o entrar
   directo por URL.

## 4. Después del primer despliegue

- Actualiza `ORIGENES_PERMITIDOS` en Render con la URL real que te dé
  Vercel (`https://tu-app.vercel.app`) y vuelve a desplegar el backend —
  si no, el navegador bloqueará las peticiones por CORS.
- Verifica `https://tu-backend.onrender.com/health` → debe responder
  `{"estado": "ok", "base_de_datos": "ok"}`.
- HTTPS es automático en ambos (Render y Vercel) — no hay nada que
  configurar.
- No expongas `DATABASE_URL` ni `SECRET_KEY` al frontend: viven solo en
  las variables de entorno del backend en Render.

## Backups

Supabase ofrece respaldos administrados — revisa la retención de tu plan.
Para un respaldo externo periódico, usa `pg_dump` contra la cadena de
conexión de Supabase y guarda el resultado fuera de Supabase también.
