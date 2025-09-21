// Presentation Layer - Routes with Dependency Injection
import { Router } from 'express';
// DIContainer will be required lazily inside the route initialization block to avoid cold-start crashes in Lambda
import { UserController } from '../controllers/UserController';
import { UniversitiesController } from '../controllers/UniversitiesController';
import { HealthController } from '../controllers/HealthController';

export function createRoutes(): Router {
  const router = Router();
  // Register health routes first so they work even if DI fails (e.g., missing DB/data in Lambda)
  const healthController = new HealthController();
  router.get('/health', healthController.checkHealth);
  router.get('/ready', healthController.checkReadiness);

  // Lazily initialize DI and feature routes to avoid blocking health checks on startup failures
  try {
    // Lazy-load DIContainer to avoid importing native deps during cold start
    const { DIContainer } = require('../../infrastructure/di/DIContainer');
    const container = DIContainer.getInstance();

    // Initialize controllers with dependencies
    const userController = new UserController(
      container.getAuthenticateUserUseCase(),
      container.getUserDashboardUseCase()
    );

    const universitiesController = new UniversitiesController(
      container.getGetUniversitiesUseCase()
    );

    // User routes
    router.post('/users/authenticate', userController.authenticateUser);
    router.get('/users/:userId/dashboard', userController.getUserDashboard);

    // University routes
    router.get('/universities', universitiesController.getUniversities);
    router.get('/universities/:id', universitiesController.getUniversityById);
  } catch (err) {
    // Do not crash the app if DI fails at cold start (e.g., native module or file not packaged in Lambda)
    console.warn('DI initialization skipped due to error. Non-health routes are unavailable until resolved.', err);
  }

  return router;
}