# API Gateway, Lambda, and Express: What We Use and Why

This document explains how API Gateway, AWS Lambda, and Express fit together in our backend, compares "Express wrapped in Lambda" vs "pure Lambda" approaches, and recommends when to use each.

## TL;DR
- Today: We use Express but run it inside AWS Lambda through `serverless-http`, fronted by API Gateway (HTTP API). This let us migrate quickly and keep the same routing/controllers.
- Alternative: A pure Lambda handler (no Express) is leaner and can offer slightly faster cold starts and smaller bundles. It requires writing simple routing and CORS yourself.
- API Gateway’s role: It’s the public HTTPS entrypoint. It receives client requests, handles routing/auth/CORS at the edge, and invokes our Lambda function with an event that contains the HTTP request.

## Where API Gateway fits in
- API Gateway (HTTP API) exposes a URL like: `https://<id>.execute-api.<region>.amazonaws.com/{proxy+}`.
- When the browser/frontend calls `/api/...`, API Gateway:
  1. Terminates TLS and accepts the HTTP request (method, path, headers, body).
  2. Applies CORS config and (optionally) authorizers.
  3. Forwards the request as a JSON event to our Lambda function.
  4. Returns the Lambda’s response back to the client.

In our Serverless config (`backend/serverless.yml`):
- `functions.app.events[0].httpApi` maps ANY method and any path to a single Lambda function.
- CORS is configured under `provider.httpApi.cors`.

## Our current Lambda setup
- Lambda runtime: Node.js 18
- Adapter: `serverless-http` wraps an Express app so it can handle API Gateway events.
- Bundling: `serverless-esbuild` to package code + dependencies into a single artifact (avoids missing module issues).
- Data: DynamoDB (Users table + GSI on `email-index`).

Relevant files:
- `backend/src/handler.ts`: creates the Express app and exports a Lambda `handler` using `serverless-http`.
- `backend/src/app.ts`: builds the Express app (CORS, JSON parsing, logging, routes).
- `backend/serverless.yml`: defines the function, API Gateway integration, DynamoDB resources, and bundling plugin.

## Option A: Express wrapped in Lambda (current)

### How it works
- We build an Express app (`createApp()`):
  - CORS via `cors` middleware
  - JSON parsing via `express.json()`
  - Routes under `/api/...` (controllers/use-cases)
- `serverless-http` converts API Gateway events to Express `req`/`res` objects.
- One Lambda function handles all routes.

### Pros
- Minimal refactor from traditional Node/Express apps.
- Mature middleware ecosystem (CORS, logging, validation, etc.).
- Easier local dev parity: run Express locally (same routes, same code).
- Fast to ship when migrating from a server to serverless.

### Cons
- Extra abstraction layer (`serverless-http`) adds a bit of cold-start overhead.
- Larger bundle size vs pure Lambda.
- You keep Express concepts even if you don’t need them.

### When to choose
- Migrating an existing Express codebase.
- Need quick results and mature middleware.
- Team is comfortable with Express semantics.

## Option B: Pure Lambda (no Express)

### How it works
- Implement a single Lambda handler (APIGatewayProxyHandlerV2):
  - Switch on `event.rawPath` and `event.requestContext.http.method`.
  - Parse `event.body` for JSON.
  - Return `statusCode`, `headers` (incl. CORS), and `body`.
- Remove `express`, `cors`, and `serverless-http` from dependencies.

### Pros
- Smallest bundle; potentially faster cold starts.
- Fewer dependencies and simpler runtime surface.
- Fine-grained control over request/response.

### Cons
- You must implement routing, error handling, and CORS yourself.
- Slightly more boilerplate per route.
- If you want advanced behavior (validation/middleware/pipes), you’ll write or import helpers yourself.

### When to choose
- Greenfield serverless projects.
- Extreme performance/cost sensitivity.
- You prefer minimal dependencies and complete control.

## Performance and cost considerations
- Cold starts: Pure Lambda can be marginally faster due to less abstraction. With Node 18 and small bundles, the difference is usually milliseconds to tens of milliseconds.
- Duration cost: Both are event-driven and scale to zero. Most cost differences are negligible unless you have very strict SLAs or very high volumes.
- Bundle size: Express adds ~100s of KBs. Bundling (esbuild) keeps size manageable.

## Migration path if you want to go pure Lambda
1. Replace `serverless-http` adapter:
   - Update `src/handler.ts` to export a function that switches on `event.rawPath` and method.
   - Inline or wrap your existing controller logic in small route handlers.
2. Remove Express-specific code:
   - Delete `app.ts`; remove `express` and `cors` from dependencies.
   - Add a small CORS helper and JSON parsing utility.
3. Keep `serverless-esbuild` bundling.
4. Test endpoints: `/api/health`, `/api/users/authenticate`, `/api/users/{id}/dashboard`.

## Recommendation for this project
- Short-term: Staying with Express-in-Lambda is perfectly fine and already working. It minimizes churn and keeps development straightforward.
- Medium-term (optional): If you’d like to shave dependencies and reduce conceptual overhead, we can refactor to pure Lambda handlers. It’s a half-day change given our current code organization.

## FAQs
- “Do I need to know Express to work on this?”
  - Not really. We use it lightly (routing, JSON body, CORS). You’ll mostly touch controllers/use-cases.
- “Where is the ‘server’?”
  - The server is API Gateway + Lambda. Express provides the familiar routing API, but it’s not a long-running server—Lambda spins up on demand.
- “Will removing Express break the frontend?”
  - No, the HTTP contract stays the same. We’d keep the same routes and JSON shapes.

---

If you want, I can provide a PR that shows both variants side-by-side (a pure-Lambda handler behind a feature flag) so you can test and compare before deciding.
