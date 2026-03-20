# Sva-Rajya Main

Sva-Rajya is a Next.js app for personal financial governance with modules for onboarding, identity, credentials, bank tracking, income, expenses, and vault workflows.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase Auth + SSR session handling
- Prisma + PostgreSQL

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database (local or hosted)
- Supabase project (URL + anon key)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create .env.local in the project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
```

3. Generate Prisma client (also runs on postinstall):

```bash
npm run postinstall
```

4. Run the app:

```bash
npm run dev
```

If port 3000 is already occupied, Next will automatically use another port (for example 3001).

## Scripts

- dev: start local dev server
- build: production build
- start: run production server
- lint: run ESLint
- postinstall: generate Prisma client

## Supabase Integration Status

Supabase is integrated in:

- Browser client wrapper: [src/lib/supabase/client.ts](src/lib/supabase/client.ts)
- Server client wrapper: [src/lib/supabase/server.ts](src/lib/supabase/server.ts)
- Session middleware: [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts)
- Route proxy wiring: [src/proxy.ts](src/proxy.ts)
- Auth UI flow: [src/app/start/page.tsx](src/app/start/page.tsx)

If NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing, the app will fail at runtime while creating the Supabase client.

## Prisma Notes

- Prisma config is in [prisma.config.ts](prisma.config.ts)
- Schema is in [prisma/schema.prisma](prisma/schema.prisma)
- Prisma reads DATABASE_URL from environment

## Known Development Notes

- Hydration warnings can be caused by browser extensions (for example Grammarly) injecting body attributes before React hydration.
- Root layout is configured to suppress body hydration attribute mismatch noise.

## Troubleshooting

1. Error: "Your project's URL and Key are required to create a Supabase client"

- Verify .env.local exists
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
- Restart the dev server

2. Auth redirects behaving unexpectedly

- Check middleware logic in [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts)
- Ensure cookies are not blocked by browser settings/extensions

3. Database errors on API routes

- Verify DATABASE_URL
- Ensure PostgreSQL is reachable
- Regenerate Prisma client with npm run postinstall
