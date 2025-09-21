# Frontend - MWSOO3A

React frontend application built with Vite and TypeScript.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development Server

The development server runs on `http://localhost:5173`

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── AuthModal.tsx
│   └── Navbar.tsx
├── pages/         # Page-level components
│   ├── Dashboard.tsx
│   ├── Universities.tsx
│   └── Welcome.tsx
├── services/      # API services
│   └── client.ts
├── types/         # TypeScript type definitions
│   └── api.ts
├── utils/         # Utility functions
│   └── helpers.ts
├── hooks/         # Custom React hooks
│   └── useApi.ts
├── auth/          # Authentication logic
│   ├── cognitoCustom.ts
│   └── session.ts
├── assets/        # Static assets
└── App.tsx        # Main application component
```

## Key Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Bootstrap** - UI components
- **AWS Cognito** - Authentication
- **React Router** - Client-side routing

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_AWS_REGION=your-aws-region
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
```