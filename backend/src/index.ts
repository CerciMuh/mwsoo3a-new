// Local server entrypoint using the shared app factory
import { createApp } from './app';

const port = parseInt(process.env.PORT || '5000');
const app = createApp();

const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

const shutdown = async () => {
  console.log('🛑 Shutting down server...');
  try {
    (app as any).shutdown && await (app as any).shutdown();
  } finally {
    server.close(() => console.log('✅ Cleanup completed'));
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;