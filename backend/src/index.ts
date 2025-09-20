import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import { authenticateCognito } from './cognitoAuth';
import { buildCorsOptions } from './config/cors';
import { getHealth } from './controllers/healthController';
import { listUniversities, refreshUniversitiesCache, searchUniversities, updateUniversities, getUniversitiesStatus } from './controllers/universitiesController';
import { getMyUniversity } from './controllers/userController';

// Initialize database on startup
initializeDatabase();

// Create user queries after database initialization (moved into controllers as needed)

const app = express();
const PORT = process.env.PORT || 4000;
// APP_BASE_URL no longer needed (email verification removed)

// Middleware
// Configure CORS via dedicated module
const corsOptions = buildCorsOptions();
app.use(cors(corsOptions));
// Ensure preflight is handled (Express v5 + path-to-regexp v6: use '(.*)' for catch-all)
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', getHealth);

// Dataset diagnostics
app.get('/universities/status', getUniversitiesStatus);

// Get universities using external API first, fallback to local DB
// Optional query: ?limit=1000
app.get('/universities', listUniversities);

// Clear external cache (manual refresh)
app.post('/universities/refresh-cache', refreshUniversitiesCache);

// Search endpoint matching examples: /search?name=Middle&country=Turkey&limit=1&offset=0
app.get('/search', searchUniversities);

// Update endpoint to refresh external dataset and clear cache
app.post('/update', updateUniversities);
app.get('/update', updateUniversities);

// Get current user's university
app.get('/me/university', authenticateCognito, getMyUniversity);

// Removed legacy auth + email verification + SMTP diagnostics

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('✅ Authentication system enabled');
  console.log('✅ University system enabled');
  // Log Cognito env for diagnostics (partially masked)
  const region = process.env.COGNITO_REGION;
  const pool = process.env.COGNITO_USER_POOL_ID;
  const client = process.env.COGNITO_CLIENT_ID;
  const mask = (v?: string) => (v ? `${v.slice(0, 4)}...${v.slice(-4)}` : 'undefined');
  console.log(`Cognito config -> REGION=${region}, USER_POOL_ID=${mask(pool)}, CLIENT_ID=${mask(client)}`);
});

export default app;