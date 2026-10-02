# vite-react-starter

Phase 0 walking skeleton for simple SPAs and internal tools: Vite + React + TypeScript + Tailwind + shadcn/ui + Zod. It already passes lint, format, typecheck, unit tests, a Playwright phone-width smoke test and a build.

## Create a project from it

```bash
gh repo create <app> --template tonylxm/vite-react-starter --private --clone
```

Then:

1. Rename: set `name` in `package.json` and `<title>` in `index.html`, and replace this README.
2. `pnpm install` (also installs the Husky hook).
3. Copy `.env.example` to `.env.local` and set the values.
4. `pnpm dev` and open http://localhost:5173.
5. In the GitHub repo settings, turn on secret scanning and push protection (templates don't copy settings).
6. Import the repo in Vercel (or another static host) and add the same env vars. Production deploys from `main`, and PRs get previews.

**Team mode** (branch + PR, CI blocks merge): remove the hook with `pnpm remove husky lint-staged && rm -rf .husky`, delete the `prepare` and `lint-staged` entries from `package.json`, and protect `main` so it requires the CI check.

## Scripts

| Script                                           | Does                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `dev` / `build` / `preview`                      | Vite                                                                     |
| `lint` / `format` / `format:check` / `typecheck` | oxlint (the Vite scaffolder's default), Prettier, `tsc -b`               |
| `test`                                           | Vitest (unit and component)                                              |
| `test:e2e`                                       | Playwright smoke test (run `pnpm exec playwright install chromium` once) |

## What's included

- Env validation in `src/lib/env.ts`, checked in `src/main.tsx` before the app renders. A missing var fails with a clear message. `VITE_` vars are baked in at build time and are public, so never put secrets in them.
- `@/*` path alias, set in `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`.
- CI (`.github/workflows/ci.yml`) and Dependabot, copied from the project-starter skill.
- A pre-commit hook that runs lint-staged (auto-fix only, no tests).
