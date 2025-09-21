// Presentation Layer - Routes with Dependency Injection
import { Router } from 'express';
import { DIContainer } from '../../infrastructure/di/DIContainer';
import { UserController } from '../controllers/UserController';
import { UniversitiesController } from '../controllers/UniversitiesController';
import { HealthController } from '../controllers/HealthController';

export function createRoutes(): Router {
  const router = Router();
  const container = DIContainer.getInstance();

  // Initialize controllers with dependencies
  const userController = new UserController(
    container.getAuthenticateUserUseCase(),
    container.getUserDashboardUseCase()
  );

  const universitiesController = new UniversitiesController(
    container.getGetUniversitiesUseCase()
  );

  const healthController = new HealthController();

  // Health check routes
  router.get('/health', healthController.checkHealth);
  router.get('/ready', healthController.checkReadiness);

  // User routes
  router.post('/users/authenticate', userController.authenticateUser);
  router.get('/users/:userId/dashboard', userController.getUserDashboard);

  // University routes
  router.get('/universities', universitiesController.getUniversities);
  router.get('/universities/:id', universitiesController.getUniversityById);

  return router;
}