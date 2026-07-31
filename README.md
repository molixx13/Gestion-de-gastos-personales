# Gestión de Gastos Personales

Aplicación web mobile-first para el seguimiento de gastos e ingresos personales, construida con Next.js (PWA), TypeScript, Tailwind CSS, Supabase y Recharts. Incluye autenticación, visualización de estadísticas y exportación de datos.

## Contenido

- [Características](#caracter%C3%ADsticas)
- [Stack](#stack)
- [Empezar](#empezar)
  - [Requisitos](#requisitos)
  - [Clonar e instalar](#clonar-e-instalar)
  - [Variables de entorno](#variables-de-entorno)
  - [Base de datos / Migraciones](#base-de-datos--migraciones)
  - [Ejecutar la aplicación](#ejecutar-la-aplicaci%C3%B3n)
- [Scripts disponibles](#scripts-disponibles)
- [Integración continua](#integraci%C3%B3n-continua)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Licencia](#licencia)

## Características

- Autenticación con Supabase Auth (registro, inicio de sesión y sesión persistente).
- Dashboard con resumen mensual (ingresos, gastos, balance) y gráficos por categoría.
- Gestión de transacciones (crear, leer, actualizar, eliminar) con filtros por mes, búsqueda y distinción entre ingresos y gastos.
- Categorías personalizables con iconos y colores.
- Exportación de datos a CSV (compatible con Excel: UTF-8 BOM + separador `;`), PDF (con gráficos y desglose por porcentajes) y backup en JSON.
- Aplicación PWA instalable con service worker y manifest.
- Diseño Mobile-first y responsive.
- Tests con Vitest y Testing Library.

## Stack

| Tecnología | Uso |
|------------|-----|
| [Next.js 14](https://nextjs.org) (App Router) | Framework, renderizado y PWA |
| [TypeScript](https://www.typescriptlang.org) | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com) | Estilos |
| [Supabase](https://supabase.com) | Autenticación y PostgreSQL |
| [Recharts](https://recharts.org) | Gráficas |
| [jsPDF](https://github.com/parallax/jsPDF) | Exportación a PDF |
| [PapaParse](https://www.papaparse.com) | Exportación a CSV |
| [Vitest](https://vitest.dev) + Testing Library | Tests unitarios y de componentes |

## Empezar

### Requisitos

- Node.js 18.17 o superior.
- Cuenta en Supabase.

### Clonar e instalar

```bash
git clone https://github.com/molixx13/Gestion-de-gastos-personales.git
cd Gestion-de-gastos-personales
npm install
```

### Variables de entorno

Copia el archivo `.env.example` a `.env.local` y completa las claves necesarias:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (Dashboard → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` del proyecto Supabase |

### Base de datos / Migraciones

Crea un proyecto en Supabase y aplica las migraciones del directorio `supabase/migrations/` en el SQL Editor del dashboard.

- `00001_initial_schema.sql` — Esquema inicial: tablas `profiles`, `categories`, `transactions`, `budgets`; Row Level Security; índices y trigger para crear perfil al registrarse.
- `00002_user_id_defaults.sql` — Ajustes para asignar `user_id` desde la sesión por defecto.

### Ejecutar la aplicación

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Sirve la build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos con TypeScript |
| `npm test` | Ejecuta la suite de tests |
| `npm run test:watch` | Ejecuta tests en modo watch |

## Integración continua

El repositorio incluye un workflow de GitHub Actions en `.github/workflows/ci.yml` que se ejecuta en cada push y pull request hacia la rama por defecto. Este workflow ejecuta lint, typecheck y tests:

- `npm run lint`
- `npm run typecheck`
- `npm test`

## Estructura del proyecto

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

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Añade las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Settings → Environment Variables.
3. Despliega; no se requiere configuración adicional.

## Licencia

Este proyecto es de uso personal. Todos los derechos reservados.
