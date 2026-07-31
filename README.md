# Gestión de Gastos Personales 💰

Aplicación web **mobile-first** para el seguimiento de gastos e ingresos personales, construida con Next.js (PWA), TypeScript, Tailwind CSS, Supabase y Recharts. Incluye autenticación, gráficas por categoría, presupuestos y exportación de datos (CSV, PDF y copia de seguridad).

## ✨ Características

- 🔐 **Autenticación** con Supabase Auth (registro, inicio de sesión y sesión persistente)
- 📊 **Dashboard** con resumen mensual (ingresos, gastos, balance) y gráficas donut por categoría
- 💸 **Gestión de transacciones** (CRUD completo) con filtro por mes, búsqueda y tipos ingreso/gasto
- 🗂️ **Categorías personalizables** con iconos y colores
- 📄 **Exportación de datos** en CSV (compatible con Excel: UTF-8 BOM + separador `;`), PDF (con gráficas y desglose por porcentajes) y backup JSON
- 📱 **PWA instalable** con service worker y manifest
- 🎨 **Mobile-first** con navegación inferior, FAB y diseño responsive
- 🧪 **Tests** con Vitest + Testing Library

## 🧰 Stack

| Tecnología | Uso |
|------------|-----|
| [Next.js 14](https://nextjs.org) (App Router) | Framework, renderizado y PWA |
| [TypeScript](https://www.typescriptlang.org) | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com) | Estilos |
| [Supabase](https://supabase.com) | Autenticación + PostgreSQL |
| [Recharts](https://recharts.org) | Gráficas |
| [jsPDF](https://github.com/parallax/jsPDF) | Exportación PDF |
| [PapaParse](https://www.papaparse.com) | Exportación CSV |
| [Vitest](https://vitest.dev) + Testing Library | Tests unitarios y de componentes |

## 🚀 Empezar

### Requisitos

- Node.js 18.17 o superior
- Una cuenta en [Supabase](https://supabase.com)

### 1. Clonar e instalar

```bash
git clone https://github.com/molixx13/Gestion-de-gastos-personales.git
cd Gestion-de-gastos-personales
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local` y completa las claves:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (Dashboard → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` del proyecto Supabase |

### 3. Configurar la base de datos

Crea un proyecto en Supabase y ejecuta las migraciones del directorio [`supabase/migrations/`](supabase/migrations) en el SQL Editor:

1. `00001_initial_schema.sql` — esquema completo (tablas `profiles`, `categories`, `transactions`, `budgets`), Row Level Security, índices y trigger para crear el perfil al registrarse.
2. `00002_user_id_defaults.sql` — red de seguridad: asigna `user_id` automáticamente desde la sesión.

### 4. Ejecutar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 📝 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Sirve la build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos con TypeScript |
| `npm test` | Ejecuta la suite de tests |
| `npm run test:watch` | Ejecuta tests en modo watch |

## 🔄 Integración continua

El proyecto incluye un workflow de [GitHub Actions](.github/workflows/ci.yml) que se ejecuta en cada push y pull request hacia `main`, verificando:

- `npm run lint`
- `npm run typecheck`
- `npm test`

## 📁 Estructura del proyecto

```
├── app/                    # Páginas (App Router) y rutas API
│   ├── auth/               # Login, registro y callback de auth
│   ├── categories/         # Gestión de categorías
│   ├── settings/           # Ajustes y exportación de datos
│   └── transactions/       # Lista, creación y edición
├── components/             # Componentes React
│   └── ui/                 # Primitivas UI (Button, Card, Input...)
├── hooks/                  # Hooks de datos (transacciones, categorías)
├── lib/                    # Clientes Supabase, utilidades y acceso a datos
├── public/                 # Service worker e iconos PWA
├── supabase/migrations/    # Esquema SQL de la base de datos
├── types/                  # Tipos TypeScript
└── __tests__/              # Tests (Vitest + Testing Library)
```

## 🚢 Despliegue en Vercel

1. Importa el repositorio en [Vercel](https://vercel.com).
2. Añade las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en **Settings → Environment Variables**.
3. Despliega — no se requiere configuración adicional.

## 📄 Licencia

Este proyecto es de uso personal. Todos los derechos reservados.
