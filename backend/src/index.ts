// Main Application Entry Point - Clean Architecture
import express from 'express';
import cors from 'cors';
import { createRoutes } from './presentation/routes';
import { DIContainer } from './infrastructure/di/DIContainer';

class Application {
  private app: express.Application;
  private port: number;
  private container: DIContainer;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000');
    this.container = DIContainer.getInstance();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging (in production, use a proper logger like Winston)
    this.app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', createRoutes());

    // 404 handler
    this.app.use('*', (_req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  }

  public getExpressApp(): express.Application {
    return this.app;
  }

  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down server...');
    this.container.cleanup();
    console.log('✅ Cleanup completed');
  }
}

// Create and start application
const app = new Application();

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  await app.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await app.shutdown();
  process.exit(0);
});

// Start the server
app.start();

export default app;