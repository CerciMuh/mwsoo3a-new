# MWSOO3A Project

A full-stack web application with separate frontend and backend services.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Modern React with functional components and hooks
- 🔷 **TypeScript** - Type safety and better developer experience
- 🏗️ **Monorepo Structure** - Organized frontend and backend services
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- � **AWS Cognito** - Authentication and user management
- 📊 **SQLite Database** - Lightweight backend database

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

### Installation & Development

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

Navigate to the `frontend/` directory for React development:
- **Port**: 5173 (development)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Bootstrap
- **Authentication**: AWS Cognito

## Backend Development

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
