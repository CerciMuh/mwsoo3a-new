import { jwtVerify, createRemoteJWKSet } from 'jose'

const REGION = process.env.COGNITO_REGION
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID
const CLIENT_ID = process.env.COGNITO_CLIENT_ID

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getIssuer(): string {
  if (!REGION || !USER_POOL_ID) throw new Error('Missing COGNITO_REGION or COGNITO_USER_POOL_ID')
  return `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`
}

function getJwks() {
  if (!jwks) {
    const url = new URL(`${getIssuer()}/.well-known/jwks.json`)
    jwks = createRemoteJWKSet(url)
  }
  return jwks!
}

export async function verifyCognitoAccessToken(token: string) {
  const issuer = getIssuer()
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer,
    clockTolerance: 10, // allow small clock skew in seconds
  })

  // Validate Cognito-specific claims
  if ((payload as any).token_use !== 'access') {
    throw new Error('Invalid token_use')
  }
  if (CLIENT_ID && (payload as any).client_id !== CLIENT_ID) {
    throw new Error('Invalid client_id')
  }

  return payload
}

export async function verifyCognitoIdToken(token: string) {
  const issuer = getIssuer()
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer,
    audience: CLIENT_ID, // ID token has 'aud' claim
    clockTolerance: 10,
  })
  if ((payload as any).token_use !== 'id') {
    throw new Error('Invalid token_use for ID token')
  }
  return payload
}

// Express middleware that authenticates using Cognito access token (Bearer) and populates req.user
export const authenticateCognito = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization'] as string | undefined
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) return res.status(401).json({ error: 'Access token required' })

    const payload = await verifyCognitoAccessToken(token)

    req.user = {
      sub: payload.sub,
      email: (payload as any).email || undefined,
      scope: (payload as any).scope || undefined,
      source: 'cognito',
      client_id: (payload as any).client_id,
    }

    // If access token lacked email, and client supplied an ID token, try to enrich with email
    if (!req.user.email) {
      const idTok = (req.headers['x-id-token'] || req.headers['x-idtoken']) as string | undefined
      if (idTok) {
        try {
          const idPayload = await verifyCognitoIdToken(idTok)
          if ((idPayload as any).email) req.user.email = (idPayload as any).email as string
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[Cognito] ID token enrichment failed:', (e as Error).message)
        }
      }
    }
    next()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Cognito] Access token verification failed:', (err as Error).message)
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Hybrid middleware: try Cognito first; if it fails, fall back to legacy JWT middleware
// Legacy fallback removed: project now uses Cognito exclusively
