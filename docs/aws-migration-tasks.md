# AWS Migration Tasks (API Gateway + Lambda + DynamoDB)

This is a step-by-step, task-based plan to migrate the backend from Express+SQLite to a serverless stack using API Gateway + Lambda + DynamoDB, keeping Cognito for auth and Vercel for the frontend.

## Legend
- [ ] To do
- [~] In progress
- [x] Done

---

## Phase 1 — Serverless bootstrap (Express on Lambda)

1. [ ] Add Serverless Framework scaffold in `backend/`
   - Files: `serverless.yml`, `src/handler.ts`
   - Use `serverless-http` to wrap the existing Express app
   - Configure HTTP API routes mapping to `/api/*`
   - Enable CORS for Vercel domain(s)
   - Runtime: `nodejs18.x`, Region: `us-east-1` (adjust if needed)
2. [ ] Add minimal IAM for logs
3. [ ] Add npm scripts: `sls:deploy`, `sls:remove`
4. [ ] Verify `sls deploy` produces an API endpoint and `/api/health` returns 200

Deliverable: Deployed API Gateway URL serving the Express app.

---

## Phase 2 — DynamoDB for Users

5. [ ] Create DynamoDB table: `mwsoo3a-users-${stage}`
   - PK: `id` (string or number)
   - GSI: `email-index` (PK: `email`) for lookup by email
6. [ ] Implement `DynamoDBUserRepository`
   - Methods: `findById`, `findByEmail`, `create`
   - Store fields: `id`, `email`, `universityId`, `createdAt`
7. [ ] Wire DI to use Dynamo when `DB=dynamo` (fallback to SQLite locally)
8. [ ] Update `/api/users/authenticate` flow to use the new repo
9. [ ] Deploy and verify creating/fetching users works end-to-end

Deliverable: Users persisted in DynamoDB via Lambda.

---

## Phase 3 — Universities data in AWS

Option A (Simple / Now)
10. [ ] Upload `world_universities.json` to S3 (e.g., `mwsoo3a-assets-<acct>-<region>`)
11. [ ] Add S3 read permissions to Lambda
12. [ ] Implement a loader to fetch JSON from S3 and cache in-memory
13. [ ] Set env: `UNIVERSITIES_S3_BUCKET`, `UNIVERSITIES_S3_KEY`
14. [ ] Verify `/api/universities` returns data from S3

Option B (Scalable / Later)
10b. [ ] Create `mwsoo3a-universities-${stage}` DynamoDB table
11b. [ ] Batch-load JSON → DynamoDB (one-time script)
12b. [ ] Update `GetUniversitiesUseCase` to query/scan with filters

Deliverable: Universities served from S3 (Option A) or DynamoDB (Option B).

---

## Phase 4 — Cognito authorizer in API Gateway

15. [ ] Configure Cognito authorizer for protected routes
    - Protect: `/api/users/authenticate`, `/api/users/{userId}/dashboard`
    - Public: `/api/health`, `/api/universities` (optional)
16. [ ] Update CORS config to allow Authorization header
17. [ ] Verify Dashboard flow with Cognito in prod

Deliverable: Authenticated endpoints via Cognito authorizer.

---

## Phase 5 — CI/CD

18. [ ] Set up GitHub Actions with AWS OIDC
19. [ ] Add workflow to run `serverless deploy` on `master`
20. [ ] Store config in repo/Actions secrets (role arn, region, table names)

Deliverable: One-click deploys from GitHub.

---

## Phase 6 — Frontend production config (Vercel)

21. [ ] Set `VITE_API_BASE_URL` to the API Gateway URL
22. [ ] Ensure `FRONTEND_URL` (CORS) matches your Vercel domain
23. [ ] Update Cognito app client callback/logout URLs to Vercel domain
24. [ ] Smoke test: `/api/health`, `/api/universities`, Dashboard signin → data

Deliverable: Fully working serverless stack in production.

---

## Appendix — Rollback/Alternatives
- Use AWS App Runner temporarily if you want to ship quickly without serverless rewrite
- Replace S3 with DynamoDB for universities once search/filter scale demands it
- Migrate SQLite → RDS if you decide to keep a relational model

---

## Notes
- Keep `/api` prefix intact — frontend already aligned
- Use environment variables for stage-based config
- Favor SSM Parameter Store/Secrets Manager for sensitive values
