import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool
} from 'amazon-cognito-identity-js';

const REGION = (import.meta as any).env?.VITE_COGNITO_REGION as string;
const USER_POOL_ID = (import.meta as any).env?.VITE_COGNITO_USER_POOL_ID as string;
const CLIENT_ID = (import.meta as any).env?.VITE_COGNITO_CLIENT_ID as string;

if (!REGION || !USER_POOL_ID || !CLIENT_ID) {
  // eslint-disable-next-line no-console
  console.warn('[Cognito] Missing VITE_COGNITO_* env vars; custom auth is disabled until configured.');
}

function getUserPool(): CognitoUserPool {
  if (!REGION || !USER_POOL_ID || !CLIENT_ID) {
    throw new Error('COGNITO_MISSING_CONFIG');
  }
  return new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  });
}

export function isCognitoConfigured(): boolean {
  return Boolean(REGION && USER_POOL_ID && CLIENT_ID);
}

export type SignUpResult = { userSub: string; userConfirmed: boolean };

export async function signUp(email: string, password: string, attributes?: Record<string,string>): Promise<SignUpResult> {
  const attrs: CognitoUserAttribute[] = [new CognitoUserAttribute({ Name: 'email', Value: email })];
  if (attributes) {
    for (const [Name, Value] of Object.entries(attributes)) {
      if (Name !== 'email') attrs.push(new CognitoUserAttribute({ Name, Value }));
    }
  }
  return new Promise((resolve, reject) => {
    try {
      const pool = getUserPool();
      pool.signUp(email, password, attrs, [], (err, data) => {
        if (err || !data) return reject(err);
        resolve({ userSub: (data as any).userSub, userConfirmed: Boolean(data.userConfirmed) });
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  const user = new CognitoUser({ Username: email, Pool: getUserPool() });
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, _result) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function resendConfirmationCode(email: string): Promise<void> {
  const user = new CognitoUser({ Username: email, Pool: getUserPool() });
  return new Promise((resolve, reject) => {
    user.resendConfirmationCode((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export type SignInResult = {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  email?: string;
  expiresAt: number;
};

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const user = new CognitoUser({ Username: email, Pool: getUserPool() });
  const auth = new AuthenticationDetails({ Username: email, Password: password });

  return new Promise((resolve, reject) => {
    user.authenticateUser(auth, {
      onSuccess: (session) => {
        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        const refreshToken = session.getRefreshToken()?.getToken();
        const exp = session.getAccessToken().getExpiration() * 1000; // ms
        resolve({ idToken, accessToken, refreshToken, email, expiresAt: exp });
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: (_userAttrs) => {
        reject(new Error('NEW_PASSWORD_REQUIRED'));
      }
    });
  });
}

export function signOut(email: string) {
  const user = new CognitoUser({ Username: email, Pool: getUserPool() });
  try { user.signOut(); } catch {}
}

export async function forgotPassword(email: string): Promise<void> {
  const user = new CognitoUser({ Username: email, Pool: getUserPool() });
  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export async function confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
  const user = new CognitoUser({ Username: email, Pool: getUserPool() });
  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}
