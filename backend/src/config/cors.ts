import cors, { CorsOptions } from 'cors';

export function buildCorsOptions(): CorsOptions | undefined {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const corsOriginEnv = process.env.CORS_ORIGIN;

  if (nodeEnv === 'production' && corsOriginEnv) {
    const allowed = corsOriginEnv.split(',').map((s) => s.trim()).filter(Boolean);
    const options: CorsOptions = {
      origin(origin, callback) {
        if (!origin) return callback(null, true); // allow non-browser clients
        if (allowed.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'X-Id-Token', 'Content-Type'],
      optionsSuccessStatus: 204,
    };
    return options;
  }
  // Dev: permissive or default behavior
  return undefined;
}

// Convenience helper to get the CORS middleware initialized with env-based options
export function createCorsMiddleware() {
  return cors(buildCorsOptions());
}
