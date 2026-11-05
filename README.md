# vite-supabase-starter

Phase 0 walking skeleton for private or SEO-unimportant apps (dashboards, client portals, internal tools): Vite + React + TypeScript + Tailwind + shadcn/ui + Zod + Supabase, with an optional Hono API in `api/` on Vercel Functions. It already passes lint, format, typecheck, unit tests, RLS integration tests against local Supabase, a Playwright phone-width smoke test and a build.

## Create a project from it

```bash
gh repo create <app> --template tonylxm/vite-supabase-starter --private --clone
```

Then:

1. Rename: set `name` in `package.json`, `<title>` in `index.html`, `project_id` in `supabase/config.toml`, and replace this README.
2. `pnpm install` (also installs the Husky hook).
3. Start Docker, then `pnpm supabase start` and write `.env.local` from it:
   ```bash
   pnpm --silent supabase status -o env --override-name api.url=VITE_SUPABASE_URL --override-name auth.publishable_key=VITE_SUPABASE_PUBLISHABLE_KEY | grep '^VITE_' > .env.local
   ```
4. `pnpm dev` and open http://localhost:5173, or `vercel dev` (http://localhost:3000) to run the API too.
5. Replace the example `notes` table: `pnpm supabase migration new <name>`, then `pnpm supabase db reset` to replay migrations locally. Keep an RLS test like `tests/db/notes-rls.test.ts` for every table.
6. In the GitHub repo settings, turn on secret scanning and push protection (templates don't copy settings).
7. **Supabase:** the client creates the project in their own Supabase organization (paid plan for production, region near their users) and invites you. Copy its URL and publishable key (Project Settings → API Keys) for the next step. Under Authentication → URL Configuration, set the Site URL to production and add the Vercel preview URL pattern to the redirect URLs, so email confirmation links work.
8. **Vercel:** in the client's Vercel team (Pro), import the repo, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Production and Preview. Production deploys from `main`, and PRs get previews. Server-only secrets (service-role, Stripe, Resend) are plain env vars without the `VITE_` prefix, read only in `api/`.
9. **Migrations in deploy:** apply them before the app deploys with `pnpm supabase db push --db-url "$DATABASE_URL"` (the project's Postgres connection string). Never change the hosted schema by hand.

**Team mode** (branch + PR, CI blocks merge): remove the hook with `pnpm remove husky lint-staged && rm -rf .husky`, delete the `prepare` and `lint-staged` entries from `package.json`, and protect `main` so it requires the CI check.

## Scripts

| Script                                           | Does                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `dev` / `build` / `preview`                      | Vite (SPA only, no `/api`). `vercel dev` runs the SPA and API together    |
| `lint` / `format` / `format:check` / `typecheck` | oxlint (type-aware, deprecated APIs are errors), Prettier, `tsc -b`       |
| `test`                                           | Vitest (unit, component and API auth)                                     |
| `test:db`                                        | Vitest integration tests against `pnpm supabase start` (RLS, API + JWT)   |
| `test:e2e`                                       | Playwright smoke tests (run `pnpm exec playwright install chromium` once) |

`vercel dev` needs the Vercel CLI (`npm i -g vercel`) and a linked project (`vercel link`). It reads `.env.local`.

## What's included

- **Auth, deny by default.** Supabase Auth with email and password (`src/pages/login.tsx`). Every route in `src/App.tsx` sits inside `RequireAuth`, which sends signed-out visitors to `/login`, except routes listed as public above it. Local Supabase skips email confirmation. Hiding a route is not authorization: RLS and the API's JWT check protect the data.
- **Browser client** in `src/lib/supabase.ts`, publishable key only. The session lives in `src/lib/auth.tsx` and `useSession()`.
- **Example table** `notes` in `supabase/migrations/`, with RLS so each user reads and writes only their own rows, and `anon` gets no grants. `tests/db/notes-rls.test.ts` proves another user and signed-out visitors can't read or change them.
- **Hono API** in `api/index.ts`, one Vercel Function behind the `/api/*` rewrite in `vercel.json`. Every route requires a Supabase access token (`Authorization: Bearer <token>`), verified with `getClaims()`. Call it from the browser with the session's token:
  ```ts
  const { data } = await supabase.auth.getSession();
  await fetch("/api/me", {
    headers: { Authorization: `Bearer ${data.session?.access_token}` },
  });
  ```
  To query as the user (RLS applies), create a client in the route with `global: { headers: { Authorization: c.req.header("Authorization") } }`. A service-role client bypasses RLS, so check authorization yourself. Keep other modules outside `api/`: Vercel deploys each file there as its own function.
- **Env validation**: `src/lib/env.ts` for the browser (checked when `src/lib/supabase.ts` loads, before the app renders) and the schema at the top of `api/index.ts`. A missing var fails with a clear message. `VITE_` vars are baked in at build time and are public, so never put secrets in them.
- `@/*` path alias, set in `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`.
- CI (`.github/workflows/ci.yml`) and Dependabot, copied from the project-starter skill. CI also starts local Supabase and runs `test:db`.
- A pre-commit hook that scans staged changes for secrets with gitleaks (`brew install gitleaks`), then runs lint-staged (auto-fix only, no tests).
