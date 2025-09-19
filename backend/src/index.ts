import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase, createUserQueries } from './database';
import { authenticateCognito } from './cognitoAuth';
import { findUniversityByEmailDomain, getUniversityById } from './universityUtils';
import { fetchAllUniversities, clearUniversitiesCache, updateExternalDataset } from './externalUniversities';

// Initialize database on startup
initializeDatabase();

// Create user queries after database initialization
const queries = createUserQueries();

const app = express();
const PORT = process.env.PORT || 4000;
// APP_BASE_URL no longer needed (email verification removed)

// Middleware
// Configure CORS: allow all in development, restrict in production via CORS_ORIGIN (comma-separated)
const nodeEnv = process.env.NODE_ENV || 'development';
const corsOriginEnv = process.env.CORS_ORIGIN;
let corsOptions: cors.CorsOptions | undefined = undefined;
if (nodeEnv === 'production' && corsOriginEnv) {
  const allowed = corsOriginEnv.split(',').map(s => s.trim()).filter(Boolean);
  corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser clients
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Authorization','X-Id-Token','Content-Type'],
    optionsSuccessStatus: 204,
  };
}
app.use(cors(corsOptions));
// Ensure preflight is handled
app.options('*', cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get universities using external API first, fallback to local DB
// Optional query: ?limit=1000
app.get('/universities', async (req, res) => {
  const limitParam = Number(req.query.limit);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
  try {
    const list = await fetchAllUniversities({ limit });
    return res.json({ source: 'file', universities: list });
  } catch (err) {
    console.error('Error fetching universities:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear external cache (manual refresh)
app.post('/universities/refresh-cache', (_req, res) => {
  clearUniversitiesCache();
  res.json({ message: 'External universities cache cleared' });
});

// Search endpoint matching examples: /search?name=Middle&country=Turkey&limit=1&offset=0
app.get('/search', async (req, res) => {
  const name = typeof req.query.name === 'string' ? req.query.name : undefined;
  const country = typeof req.query.country === 'string' ? req.query.country : undefined;
  const limitParam = Number(req.query.limit);
  const offsetParam = Number(req.query.offset);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
  const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : undefined;

  const toPublic = (u: any) => ({
    web_page: `http://${u.domain}/`,
    country: u.country,
    domain: u.domain,
    name: u.name,
  });

  try {
    // Try external provider first
    const results = await fetchAllUniversities({ name, country, limit, offset });
    return res.json(results.map(toPublic));
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update endpoint to refresh external dataset and clear cache
const updateHandler = async (_req: express.Request, res: express.Response) => {
  try {
    const result = await updateExternalDataset().catch(() => ({ status: 'ok', message: 'Cache cleared; external update not supported' }));
    clearUniversitiesCache();
    return res.json(result);
  } catch (err) {
    console.error('Update endpoint error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to update dataset' });
  }
};

app.post('/update', updateHandler);
app.get('/update', updateHandler);

// Get current user's university
app.get('/me/university', authenticateCognito, async (req, res) => {
  try {
    // If Cognito user: use email to look up or create local user record
    let user: any = null;
    const ru = (req as any).user;
    if (ru?.source === 'cognito' && ru?.email) {
      user = queries.findUserByEmail.get(ru.email);
      if (!user) {
        // Create a local record so we can assign university mapping by domain
        const domainMatch = await findUniversityByEmailDomain(ru.email).catch(() => null);
        const uniId = domainMatch ? domainMatch.id : null;
        queries.createUser.run(ru.email, uniId);
        user = queries.findUserByEmail.get(ru.email);
      }
    } else if (ru?.userId) {
      user = queries.findUserById.get(ru.userId) as any;
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.universityId) {
      return res.json({ university: null, message: 'No university assigned' });
    }

    const university = await getUniversityById(user.universityId);
    res.json({ university });
  } catch (error) {
    console.error('Error fetching user university:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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