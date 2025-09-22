# MWSOO3A Project

A modern web application built with **Clean Architecture** principles, featuring React 19 frontend and Node.js backend with strict **SOLID** compliance.

## 🏗️ Architecture Overview

This project follows **Clean Architecture** patterns with complete separation of concerns:

```
📁 Project Structure
├── frontend/          # React 19 + Vite + TypeScript (Clean Architecture)
├── backend/          # Node.js + TypeScript (Clean Architecture)
└── docs/             # Documentation and guides
```

### **Clean Architecture Layers**

```
🎯 Domain Layer (Core Business Logic)
├── entities/          # Business entities with rules
├── repositories/      # Abstract repository interfaces  
└── services/         # Domain services

🎯 Application Layer (Use Cases)
└── useCases/         # Application-specific business rules

🎯 Infrastructure Layer (External Concerns)
├── repositories/     # Concrete repository implementations
└── di/              # Dependency injection container

🎯 Presentation Layer (HTTP Interface)
├── controllers/     # Thin HTTP request handlers
└── routes/         # API endpoint definitions
```

## ✨ Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Modern React with functional components and hooks
- 🔷 **TypeScript** - Full type safety with strict configuration
- 🏗️ **Clean Architecture** - SOLID principles implementation
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔐 **AWS Cognito** - Authentication and user management
- 📊 **SQLite Database** - Lightweight backend database
- 🔄 **Dependency Injection** - IoC container for clean dependencies

## Project Structure

```
mwsoo3a-new/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── auth/          # Authentication logic
│   ├── public/        # Static assets
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Node.js + Express + SQLite backend
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   ├── config/        # Configuration files
│   │   └── scripts/       # Utility scripts
│   ├── package.json
│   └── tsconfig.json
├── docs/              # Project documentation
└── package.json       # Root workspace configuration
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

1. **Install dependencies for all packages:**
   ```bash
   npm run install:all
   ```

2. **Start both frontend and backend in development mode:**
   ```bash
   npm run dev
   ```

3. **Or start them separately:**
   ```bash
   # Frontend only (http://localhost:5173)
   npm run dev:frontend

   # Backend only (http://localhost:3000)
   npm run dev:backend
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Frontend Development

## Production backend integration

To enable the frontend to call the deployed backend in production:

- On Vercel (frontend), set environment variables:
  - `VITE_API_BASE_URL` = your API Gateway base URL including stage, e.g. `https://<apiId>.execute-api.<region>.amazonaws.com/dev`
  - Existing Cognito vars (`VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REGION`, etc.)
- On the backend (Serverless), ensure CORS allows your Vercel domain:
  - Set `FRONTEND_URL` to `https://your-vercel-domain` and deploy the backend.
- Universities dataset:
  - The backend will load `world_universities.json` when present; otherwise it falls back to the Hipolabs public dataset when `UNIVERSITIES_ALLOW_REMOTE=true` (default in serverless.yml).

After setting the variables, redeploy both apps. The Dashboard will authenticate the user against Cognito, create/read the user in DynamoDB, and map the email domain to a university. The Universities page will be served by the backend when `VITE_API_BASE_URL` is set.
Navigate to the `frontend/` directory for React development:
- **Port**: 5173 (development)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
Navigate to the `backend/` directory for API development:
- **Port**: 3000 (default)
- **Framework**: Express.js with TypeScript
- **Database**: SQLite with better-sqlite3
- **Authentication**: AWS Cognito JWT verification

## Environment Configuration

Copy `.env.example` to `.env.local` and configure your environment variables:

```bash
cp .env.example .env.local
```

## Backend Integration Ready

The project is structured for easy backend integration:

- **API Service Layer** - Abstracted API calls in `src/services/api.ts`
- **Type Definitions** - Ready for backend response types in `src/types/`
- **Custom Hooks** - `useApi` hook for data fetching
- **Environment Variables** - Configured for different API endpoints

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

flowchart TD
    A[User Browser] -->|HTTP/HTTPS| B[Frontend (React + Vite)]
    B -->|API Calls /api/*| C[API Gateway (HTTP API)]
    C --> D[Lambda (Node.js 18 + Express via serverless-http)]
    D -->|User Data| E[(DynamoDB Users Table)]
    D -->|University Data| F[JSON Dataset (world_universities.json)]

    subgraph Frontend
        B1[Components] 
        B2[Pages]
        B3[Services API Client]
        B4[Cognito Auth (stub)]
        B1 --> B2 --> B3
        B3 --> B4
    end

    subgraph Backend
        D1[Presentation: Controllers & Routes]
        D2[Application: Use Cases]
        D3[Domain: Entities]
        D4[Infrastructure: DynamoDB & JSON Repositories]
        D1 --> D2 --> D3 --> D4
    end
