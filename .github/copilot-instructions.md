<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## React + Vite + TypeScript Project

This is a modern React application built with Vite and TypeScript, structured for future backend and database integration.

### Development Guidelines
- Use TypeScript for all new components and utilities
- Follow React functional components with hooks
- Organize components in feature-based directories
- Use absolute imports with path aliases configured in vite.config.ts
- Prepare for backend integration with proper API service structure

### Project Structure
- `/src/components` - Reusable UI components
- `/src/pages` - Page-level components
- `/src/services` - API services (prepared for backend integration)
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions
- `/src/hooks` - Custom React hooks

### Future Backend Integration
- Keep API service layer abstracted for easy backend connection
- Use environment variables for API endpoints
- Structure types to match future API responses