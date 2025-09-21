// Express App Factory for both local server and Lambda
import express from 'express';
import cors from 'cors';
import { createRoutes } from './presentation/routes';

export function createApp(): express.Application {
  const app = express();

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging (basic)
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Lightweight liveness endpoint outside of /api to isolate issues
  app.get('/ping', (_req, res) => {
    res.status(200).json({ ok: true, ts: new Date().toISOString() });
  });

  // API routes
  app.use('/api', createRoutes());

  // 404 handler
  app.use('*', (_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Global error handler
  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  });

  // Expose a shutdown hook to clean DI container when needed (local only)
  (app as any).shutdown = async () => {
    // No-op in Lambda; local cleanup handled within repositories if needed
    return;
  };

  return app;
}
