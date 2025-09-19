# Backend Setup Notes

This backend uses Express, better-sqlite3, dotenv, and jose (for Cognito JWT verification). The users table is stored in SQLite; universities are read from `world_universities.json` (no universities table needed).

If you run into npm SSL errors on Windows, try one of these:

1) Temporarily relax npm SSL (use only if needed; revert after):
```
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false
```

2) Use yarn as an alternative:
```
npm install -g yarn
yarn
```

Once dependencies are installed:

- Copy `.env.example` to `.env` and set your Cognito values
- Run dev server: `npm run dev`

Current status:
- Health check and universities endpoints are active
- Auth is handled in the frontend via Amazon Cognito; backend validates Cognito tokens
- On first authenticated request, backend auto-links a university by email domain using the JSON dataset
## Cognito configuration

Set in `backend/.env`:

```
COGNITO_REGION=eu-central-1
COGNITO_USER_POOL_ID=eu-central-1_XXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

To configure Cognito to send emails for verification and password reset, choose one mode:

1) Cognito default email (quickest)

- Uses Cognito-managed email delivery. No SES setup required.
- From the `backend/` folder, ensure `COGNITO_REGION` and `COGNITO_USER_POOL_ID` are set in `.env`, then run:

```
npm run configure:cognito:email
```

2) Your own SES identity (recommended)

- Verify a domain or email in AWS SES.
- In `backend/.env`, set:

```
COGNITO_EMAIL_MODE=SES
COGNITO_SES_FROM_ADDRESS=you@your-domain.com
COGNITO_SES_SOURCE_ARN=arn:aws:ses:REGION:ACCOUNT:identity/your-domain.com
COGNITO_SES_REPLY_TO_ADDRESS=support@your-domain.com
```

Then run:

```
npm run configure:cognito:email
```

Frontend configuration (`.env` at repo root):

```
VITE_COGNITO_REGION=eu-central-1
VITE_COGNITO_USER_POOL_ID=eu-central-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

Notes
- The frontend must use a SPA App Client WITHOUT a client secret.
- The backend validates Cognito tokens. Client ID and Pool must match between frontend and backend.
- After changing email configuration, try a fresh sign-up or use the "Resend code" link in the app's Confirm step.