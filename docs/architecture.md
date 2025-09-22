# System Architecture Overview

This document describes the end-to-end architecture of the application: frontend (React/Vite), backend (Node.js/Express on AWS Lambda), data (DynamoDB + JSON dataset), and platform components (API Gateway, Serverless Framework). It covers request flows, build/deploy, configuration, and operations.

## High-level Diagram

Frontend (React, Vite, TypeScript) → API Gateway (HTTP API) → AWS Lambda (Node 18, Express via serverless-http) → DynamoDB (Users)

Additionally: a static JSON dataset for universities is packaged/loaded (or gracefully skipped if not present in Lambda).

## Frontend
- Framework: React + Vite + TypeScript
- Structure:
  - `src/components` – Reusable components (e.g., `Navbar`, `AuthModal`)
  - `src/pages` – Pages (`Welcome`, `Universities`, `Dashboard`, `AuthCallback`, `VerifyEmail`)
  - `src/services` – API client (`api.ts`, `client.ts`)
  - `src/auth` – Cognito integration placeholders (`cognito.ts`, `session.ts`) prepared for future auth
  - `src/hooks` – Custom hooks (`useApi.ts`)
  - `src/types` – Shared DTOs / typings
  - `src/utils` – Helpers
- Build: Vite
- Hosting: currently local development; prepared for Vercel/Static hosting (see `vercel.json` and CORS in backend)
- Configuration: base API URL points to API Gateway and uses `/api` route prefix.

## Backend
- Language/Runtime: TypeScript on Node.js 18
- Framework: Express (wrapped by Lambda via `serverless-http`)
- Composition:
  - `src/app.ts` – Express app factory (CORS, JSON parsing, logging, routes)
  - `src/handler.ts` – Lambda entrypoint, wraps Express with `serverless-http`
  - `src/index.ts` – Local dev server (optional)
  - `src/presentation` – Controllers and route registration
  - `src/application` – Use cases (business logic orchestrations)
  - `src/domain` – Entities, repository interfaces, domain services
  - `src/infrastructure` – Repositories (DynamoDB/JSON), DI container
- Key controllers & routes (mounted under `/api`):
  - Health: `GET /api/health` (and `GET /api/ready`, `GET /api/healthz` for diagnostics)
  - Users: `POST /api/users/authenticate`, `GET /api/users/:userId/dashboard`
  - Universities: `GET /api/universities`, `GET /api/universities/:id`
- Dependency Injection: `DIContainer` wires repositories and use-cases
  - Users → `DynamoDbUserRepository`
  - Universities → `JsonUniversityRepository` (loads from a JSON file if available, else an empty dataset)

## Data Layer
- Users: DynamoDB table (PAY_PER_REQUEST)
  - Primary key: `id` (string)
  - GSI: `email-index` on `email` (string), used for lookup by email
  - Managed via CloudFormation in `serverless.yml`, with IAM permissions scoped to this table and its index
- Universities: `world_universities.json`
  - Accessed by `JsonUniversityRepository`
  - In Lambda, file may not be present; repository logs a warning and serves an empty list safely

## AWS Components
- API Gateway (HTTP API)
  - Public HTTPS endpoint for all routes (ANY /{proxy+})
  - CORS configured (localhost and deployed frontend origin)
- Lambda (Node.js 18)
  - Single function `app` handling all API routes
  - Uses `serverless-http` to adapt API Gateway events to Express
  - Bundled via `serverless-esbuild` to include all dependencies
- DynamoDB
  - Users table provisioned via `serverless.yml`
  - IAM permissions attached to the Lambda role

## Build & Deploy
- Tooling: Serverless Framework v3
- Bundler: `serverless-esbuild` (creates a self-contained artifact)
- Scripts (backend/package.json):
  - `build`: TypeScript compile to `dist/`
  - `sls:deploy`: `serverless deploy`
  - `sls:remove`: `serverless remove`
- Deployment flow:
  1. `npm run build` (TypeScript → dist)
  2. `serverless deploy` (esbuild bundles source + deps; deploys Lambda, API Gateway, DynamoDB)

## Configuration & Environment
- `serverless.yml`:
  - `provider.httpApi.cors` – allowed origins/headers/methods
  - Env vars: `FRONTEND_URL`, `DYNAMO_USERS_TABLE`
  - IAM role statements for DynamoDB table and its index
  - Resource: `Users` DynamoDB table + `email-index`
- Runtime envs:
  - Local dev can set env via `.env` or shell
  - Lambda gets env from Serverless config

## Request Flows

### Health Check
1. Client calls `GET /api/health`
2. API Gateway forwards to Lambda
3. Express route returns `{ success: true, data: { status: "healthy" } }`

### Authenticate User
1. Client posts `{ email }` to `POST /api/users/authenticate`
2. Lambda → Use case checks DynamoDB for existing user by email (GSI), creates if missing
3. Returns user data and associated university (if mapped)

### User Dashboard
1. Client calls `GET /api/users/:userId/dashboard`
2. Lambda → Fetch user by id from DynamoDB; return user + university info

### Universities Search
1. Client calls `GET /api/universities?search=...&country=...&limit=...`
2. Lambda → `JsonUniversityRepository` loads/filter data; returns a list

## Error Handling & Observability
- Express global error handler returns `{ success: false, error: "Internal server error" }`
- CloudWatch Logs capture Lambda init/runtime errors (e.g., missing modules)
- We added `/api/healthz` for quick diagnostics when packaging issues occur

## Security & CORS
- CORS is handled in Express and reinforced via API Gateway CORS config
- Future: add Cognito (user auth), protect routes with JWT/authorizers

## Alternatives & Future Work
- Pure Lambda (no Express): reduce deps and cold-start overhead; requires custom router/CORS handling
- Add Cognito for authentication (signup/signin, email verification)
- S3 for static assets or user-uploaded content
- CI/CD via GitHub Actions for deploys
- Infrastructure tests (e.g., with AWS SAM or LocalStack for limited local validation)

## Trade-offs Recap
- Express-in-Lambda: fastest migration, mature middleware, slightly larger bundle
- Pure Lambda: leaner, fewer deps, more boilerplate; good for greenfield or perf-sensitive paths

---

This reflects the current system state on branch `master`. If you want a diagram image (PlantUML/Mermaid) or a README “Architecture” summary with links to this doc, I can add that next.
