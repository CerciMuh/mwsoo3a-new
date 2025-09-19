# React + TypeScript + Vite Project

A modern React application built with Vite and TypeScript, structured for scalability and future backend integration.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Modern React with functional components and hooks
- 🔷 **TypeScript** - Type safety and better developer experience
- 🏗️ **Structured Architecture** - Organized for future backend integration
- 🎨 **CSS Modules** - Scoped styling support
- 🔧 **ESLint** - Code linting and formatting

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page-level components
├── services/      # API services (ready for backend)
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── hooks/         # Custom React hooks
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

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
