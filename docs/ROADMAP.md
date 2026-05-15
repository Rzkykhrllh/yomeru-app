# Yomeru — Production Readiness Roadmap

This document is a step-by-step checklist to bring Yomeru from a personal local tool to a deployed, multi-user web application. Each checkpoint is self-contained and can be handed to an AI agent to execute independently.

---

## Checkpoint 1 — Fix Critical Bugs

> These are broken things that will cause the app to crash or misbehave on any server. Must be fixed before anything else.

- [x] **1.1 Fix hardcoded absolute path in `tokenizer.ts`**
  - File: `apps/api/src/services/tokenizer.ts`
  - Problem: There is a hardcoded absolute path `/Users/rizky/Desktop/Code/Personal/yomeru-app/node_modules/kuromoji/dict` in the dictionary path fallback list. This will never exist on any other machine or server.
  - Fix: Remove the hardcoded absolute path entry. Keep only the relative paths resolved with `path.resolve(__dirname, ...)`.

- [x] **1.2 Fix `NEXT_PUBLIC_API_URL` in `docker-compose.yml`**
  - File: `docker-compose.yml`
  - Problem: The `web` service has `NEXT_PUBLIC_API_URL=http://localhost:3001`. Since `NEXT_PUBLIC_*` variables are baked into the Next.js build at compile time and used by the browser, this means the browser will try to call `localhost:3001` — which points to the user's own machine, not the server.
  - Fix: This variable needs to be set to the actual public URL of the API when building for production (e.g., `https://api.yourdomain.com`). For now, add a comment in `docker-compose.yml` documenting that this must be changed before production build.

- [x] **1.3 Add `prisma migrate deploy` to API startup**
  - File: `apps/api/Dockerfile`
  - Problem: The API container starts with `node dist/index.js` directly. On a fresh deployment with an empty database, Prisma will throw errors because the tables don't exist yet.
  - Fix: Create an entrypoint shell script (`apps/api/entrypoint.sh`) that runs `npx prisma migrate deploy` before starting the server. Update the Dockerfile `CMD` to use this entrypoint script.

- [x] **1.4 Fix `deleteVocab` and `deleteText` returning 500 for missing records**
  - Files: `apps/api/src/controllers/vocabController.ts`, `apps/api/src/controllers/textController.ts`
  - Problem: When deleting a record that doesn't exist, Prisma throws error code `P2025`. This is currently caught by the generic error handler and returns a `500`. It should return a `404`.
  - Fix: In the delete controllers, catch Prisma errors and check if the error code is `P2025`. If so, return `res.status(404).json({ error: 'Not found' })`.

---

## Checkpoint 2 — Database Hardening

> Improve data integrity at the database level, not just application level.

- [x] **2.1 Add unique constraint on `Vocab.word`**
  - File: `apps/api/prisma/schema.prisma`
  - Problem: Uniqueness of `word` is only enforced in application code via `findFirst`. Concurrent requests can still create duplicate vocab entries.
  - Fix: Add `@@unique([word])` to the `Vocab` model. Then create and run a new Prisma migration.

- [x] **2.2 Add unique constraint on `TextVocab`**
  - File: `apps/api/prisma/schema.prisma`
  - Problem: Same issue — duplicate `(vocabId, textId, sentence)` combinations can be created under concurrent conditions.
  - Fix: Add `@@unique([vocabId, textId, sentence])` to the `TextVocab` model. Create and run a new Prisma migration.

- [x] **2.3 Add `updatedAt` field to all models**
  - File: `apps/api/prisma/schema.prisma`
  - Problem: There is no way to know when a record was last modified.
  - Fix: Add `updatedAt DateTime @updatedAt @map("updated_at")` to `Vocab`, `Text`, and `TextVocab` models. Create and run a new Prisma migration.

---

## Checkpoint 3 — Security Hardening

> Minimum security measures before exposing the app to the public internet.

- [x] **3.1 Add `helmet` to Express**
  - File: `apps/api/src/index.ts`
  - Problem: No HTTP security headers are set (no CSP, HSTS, X-Frame-Options, etc.).
  - Fix: Install `helmet` (`npm install helmet` in `apps/api`). Add `app.use(helmet())` near the top of the Express setup in `index.ts`.

- [x] **3.2 Restrict CORS to known origins**
  - File: `apps/api/src/index.ts`
  - Problem: `app.use(cors())` with no config allows requests from any origin — any website can call the API.
  - Fix: Update CORS config to only allow the frontend origin. Read the allowed origin from an environment variable (e.g., `CORS_ORIGIN`). Example: `app.use(cors({ origin: process.env.CORS_ORIGIN }))`. Add `CORS_ORIGIN` to `.env.example`.

- [x] **3.3 Add rate limiting to `/api/tokenize`**
  - File: `apps/api/src/index.ts` or `apps/api/src/routes/tokenize.ts`
  - Problem: The tokenize endpoint runs CPU-bound NLP analysis on every request. No rate limiting means it can be abused to spike server CPU.
  - Fix: Install `express-rate-limit` (`npm install express-rate-limit` in `apps/api`). Apply a rate limiter specifically to `/api/tokenize` — e.g., max 30 requests per minute per IP.

- [x] **3.4 Add input validation with `zod`**
  - Files: All files in `apps/api/src/controllers/`
  - Problem: Input validation is done manually with `if (!field)` checks. No type safety, no format validation, easy to miss edge cases.
  - Fix: Install `zod` (`npm install zod` in `apps/api`). Create validation schemas for all request bodies (create vocab, update vocab, create text, update text, create text-vocab, tokenize). Validate in each controller before touching Prisma.

- [x] **3.5 Move hardcoded credentials out of `docker-compose.yml`**
  - File: `docker-compose.yml`
  - Problem: `POSTGRES_PASSWORD: yomeru_dev_pass` is hardcoded in the compose file.
  - Fix: Replace all hardcoded secrets in `docker-compose.yml` with references to environment variables using the `${VAR_NAME}` syntax. Create a `.env.docker` example file documenting required variables. Add `.env.docker` to `.gitignore`.

- [x] **3.6 Set Prisma log level to errors only**
  - File: `apps/api/src/lib/prisma.ts`
  - Problem: Prisma is configured with `log: ['query', 'error', 'warn']` — this logs every SQL query, which is very verbose and can leak sensitive data in production logs.
  - Fix: Change to `log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']`.

---

## Checkpoint 4 — Authentication & Multi-tenancy

> The biggest and most important change. Adds user accounts and isolates each user's data.

**Context:** Currently there is no user model and all data is globally shared. Every API endpoint needs to be updated to scope data by the authenticated user.

- [x] **4.1 Add `User` model to Prisma schema**
  - File: `apps/api/prisma/schema.prisma`
  - Fix: Add a `User` model with fields: `id` (cuid), `email` (unique), `createdAt`. Add `userId String @map("user_id")` and the corresponding relation to `Vocab` and `Text` models. `TextVocab` is implicitly scoped via `Vocab` and `Text`, but consider adding `userId` there too for query efficiency. Create and run a new migration.

- [x] **4.2 Implement authentication using Clerk — frontend (`apps/web`)**
  - Install `@clerk/nextjs`
  - Wrap the app with `ClerkProvider` in `apps/web/src/app/layout.tsx`
  - Add `middleware.ts` at `apps/web/src/middleware.ts` to protect all routes except public ones
  - Add sign-in and sign-up pages using Clerk's built-in components
  - Update `apps/web/src/lib/api.ts` fetcher to include the Clerk session token in the `Authorization` header on every request
  - Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `apps/web/.env.example`

- [x] **4.3 Implement authentication using Clerk — backend (`apps/api`)**
  - Install `@clerk/express`
  - Add Clerk auth middleware to Express that verifies the JWT from the `Authorization` header
  - Make the verified `userId` available on `req.auth.userId`
  - Add `CLERK_SECRET_KEY` to `apps/api/.env.example`

- [x] **4.4 Scope all API queries by `userId`**
  - Files: All files in `apps/api/src/controllers/`
  - Fix: Update every Prisma query to include `where: { userId: req.auth.userId }` (or equivalent). For create operations, include `userId: req.auth.userId` in the data. This ensures users can only see and modify their own data.

- [x] **4.5 Handle new user creation on first sign-in**
  - When a user signs in for the first time via Clerk, their `userId` (from Clerk) is used directly as the FK — no separate user sync needed unless you want to store extra user metadata locally.
  - Verify this works end-to-end: new user signs up → creates a text → only sees their own data.

---

## Checkpoint 5 — Frontend Polish

> Fix UX issues and improve resilience for real users.

- [x] **5.1 Self-host fonts via `next/font`**
  - File: `apps/web/src/app/globals.css` and `apps/web/src/app/layout.tsx`
  - Problem: Fonts are loaded from `fonts.googleapis.com`. This is a network dependency (slower on first load) and a GDPR concern in some regions since it leaks user IPs to Google.
  - Fix: Replace the `@import` from Google Fonts with `next/font/google`. Import `Plus_Jakarta_Sans` and `Noto_Sans_JP` in `layout.tsx` using `next/font/google` and apply them via CSS variables.

- [x] **5.2 Add error boundary**
  - Files: Create `apps/web/src/app/error.tsx` and `apps/web/src/app/global-error.tsx`
  - Problem: There is no App Router error boundary. Unhandled rendering errors show a blank white screen.
  - Fix: Create `error.tsx` with a friendly error UI and a "Try again" button that calls `reset()`. Create `global-error.tsx` for root-level errors.

- [x] **5.3 Improve SWR error retry behavior**
  - File: `apps/web/src/app/providers.tsx`
  - Problem: `shouldRetryOnError: false` means any transient network blip permanently breaks a component until the user manually refreshes the page.
  - Fix: Change to `shouldRetryOnError: true` with `errorRetryCount: 3` and `errorRetryInterval: 5000`.

- [x] **5.4 Remove dead code `SaveTextModal.tsx`**
  - File: `apps/web/src/components/SaveTextModal.tsx`
  - Problem: This component exists but is not imported or used anywhere in the codebase.
  - Fix: Delete the file.

---

## Checkpoint 6 — Docker & Build Optimization

> Make Docker images production-grade and smaller.

- [ ] **6.1 Add `output: 'standalone'` to `next.config.js`**
  - File: `apps/web/next.config.js`
  - Problem: The current web Docker image copies the entire `node_modules` folder, producing a very large image (often 1GB+).
  - Fix: Add `output: 'standalone'` to the Next.js config. This makes Next.js produce a minimal self-contained output in `.next/standalone` that includes only the necessary server files.

- [ ] **6.2 Update web Dockerfile for standalone output**
  - File: `apps/web/Dockerfile`
  - Problem: After adding `output: 'standalone'`, the Dockerfile runner stage needs to copy from `.next/standalone` instead of the full app directory.
  - Fix: Update the runner stage to copy `.next/standalone`, `.next/static` into `standalone/.next/static`, and `public` into `standalone/public`. Set `CMD ["node", "server.js"]`.

- [ ] **6.3 Add health checks to Dockerfiles**
  - Files: `apps/api/Dockerfile`, `apps/web/Dockerfile`
  - Problem: No `HEALTHCHECK` instructions in either Dockerfile. Without this, Docker and orchestrators (Railway, etc.) can't tell if the container is actually healthy.
  - Fix: Add `HEALTHCHECK` to the API Dockerfile that calls `GET /health`. Add a basic HTTP health check to the web Dockerfile.

- [ ] **6.4 Finalize entrypoint script for API migrations**
  - File: `apps/api/entrypoint.sh` (created in 1.3)
  - Ensure the script contains:
    ```sh
    #!/bin/sh
    npx prisma migrate deploy
    exec node dist/index.js
    ```
  - Confirm it is executable (`chmod +x entrypoint.sh`) and the Dockerfile `CMD` points to it.

---

## Checkpoint 7 — Deploy

> Get the app live on the internet.

- [ ] **7.1 Set up Railway project (API + Database)**
  - Go to [railway.app](https://railway.app) and create a new project
  - Add a **PostgreSQL** service — Railway will provision the DB and provide a `DATABASE_URL`
  - Add a new service from the GitHub repo, set root directory to `apps/api`
  - Set environment variables:
    - `DATABASE_URL` — from the Railway PostgreSQL service
    - `PORT` — `3001`
    - `CORS_ORIGIN` — the Vercel frontend URL (fill in after step 7.2)
    - `CLERK_SECRET_KEY` — from Clerk dashboard
    - `NODE_ENV` — `production`

- [ ] **7.2 Set up Vercel project (Web)**
  - Go to [vercel.com](https://vercel.com) and import the GitHub repo
  - Set the **root directory** to `apps/web`
  - Set environment variables:
    - `NEXT_PUBLIC_API_URL` — the Railway API public URL
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
    - `CLERK_SECRET_KEY` — from Clerk dashboard
  - Deploy and note the Vercel URL (e.g., `https://yomeru-app.vercel.app`)

- [ ] **7.3 Update CORS on Railway after Vercel deploy**
  - Go back to Railway API service environment variables
  - Set `CORS_ORIGIN` to the Vercel URL from step 7.2

- [ ] **7.4 Run smoke tests on production**
  - [ ] Can sign up and log in
  - [ ] Can create a new text
  - [ ] Tokenization works (view mode)
  - [ ] Can save a vocab by clicking a word
  - [ ] Vocab appears in vocab list
  - [ ] Word is highlighted in text view
  - [ ] Can delete a vocab
  - [ ] Can delete a text
  - [ ] Dark/light theme toggle works
  - [ ] Another account cannot see the first account's data

---

## Checkpoint 8 — Post-Deploy (Optional, Good for Portfolio)

> Quality improvements that make the project look more polished.

- [ ] **8.1 Set up GitHub Actions CI/CD**
  - Create `.github/workflows/deploy.yml`
  - On push to `main`: run lint → build → auto-deploy to Vercel (web) and Railway (api)
  - Use GitHub secrets for all credentials

- [ ] **8.2 Add error tracking with Sentry**
  - Install `@sentry/nextjs` in `apps/web` and `@sentry/node` in `apps/api`
  - Configure Sentry DSN via environment variables
  - Sentry free tier is sufficient for low-traffic apps

- [ ] **8.3 Add structured logging to the API**
  - Install `pino` and `pino-http` in `apps/api`
  - Replace `console.log` calls with `pino` logger
  - Structured JSON logs are much easier to read in Railway's log viewer

- [ ] **8.4 Create shared `packages/japanese-utils`**
  - Problem: `apps/web/src/lib/normalizeJapanese.ts` and `apps/api/src/utils/kanaConverter.ts` contain nearly identical katakana→hiragana conversion logic.
  - Fix: Create `packages/japanese-utils/` with a shared `normalizeJapanese` function. Update both apps to import from the shared package.

- [ ] **8.5 Add basic test suite**
  - In `apps/api`: set up Vitest, write unit tests for controllers and the tokenizer service
  - In `apps/web`: set up React Testing Library, write tests for key components (`TextEditor`, `VocabModal`)
  - Aim for coverage on the core user flows, not 100% coverage

---

## Notes for AI Agents

- Always run `npm install` in the correct workspace directory (`apps/api` or `apps/web`), not the root.
- After any Prisma schema change, run `npx prisma migrate dev --name <description>` in `apps/api` to create a migration, and `npx prisma generate` to regenerate the client.
- The monorepo uses Turborepo. To run commands across all workspaces: `npm run dev` from root. To run in a specific workspace: `npm run dev --workspace=apps/web`.
- TypeScript types shared between web and api are currently duplicated. Until Checkpoint 8.4 creates a shared package, keep them in sync manually.
- All environment variables for the API go in `apps/api/.env`. All for the web go in `apps/web/.env.local`.
