// Infrastructure: Environment Configuration Repository
import type { IConfigRepository } from '../../domain/repositories/interfaces';

export class EnvConfigRepository implements IConfigRepository {
  public getApiBaseUrl(): string {
    const isDev = !!import.meta.env.DEV;
    const defaultDevBase = 'http://localhost:5000'; // Updated to match refactored backend
    return import.meta.env.VITE_API_BASE_URL || (isDev ? defaultDevBase : '');
  }

  public getCognitoConfig(): {
    region: string;
    userPoolId: string;
    clientId: string;
  } {
    return {
      region: import.meta.env.VITE_COGNITO_REGION || 'us-east-1',
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || ''
    };
  }

  public isDevelopment(): boolean {
    return !!import.meta.env.DEV;
  }

  public isProduction(): boolean {
    return import.meta.env.PROD === true;
  }
}