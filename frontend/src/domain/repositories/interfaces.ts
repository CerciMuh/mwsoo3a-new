// Domain Repository Interfaces - Abstract contracts
import { User } from '../entities/User';
import { University } from '../entities/University';
import { AuthSession } from '../entities/AuthSession';

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>;
  getUserUniversity(userId: string): Promise<{ user: User; university: University | null }>;
  authenticateUser(email: string): Promise<{ user: User; university: University | null; isNewUser: boolean }>;
}

export interface IUniversityRepository {
  getAll(params?: { limit?: number; search?: string; country?: string }): Promise<University[]>;
  getById(id: number): Promise<University | null>;
  searchByName(query: string): Promise<University[]>;
  findByDomain(domain: string): Promise<University | null>;
}

export interface IAuthRepository {
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): Promise<void>;
  confirmSignUp(email: string, code: string): Promise<AuthSession>;
  forgotPassword(email: string): Promise<void>;
  confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
}

export interface IStorageRepository {
  setItem<T>(key: string, value: T): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface ISessionRepository {
  saveSession(session: AuthSession): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  clearSession(): Promise<void>;
  isSessionValid(): Promise<boolean>;
}

export interface IConfigRepository {
  getApiBaseUrl(): string;
  getCognitoConfig(): {
    region: string;
    userPoolId: string;
    clientId: string;
  };
  isDevelopment(): boolean;
  isProduction(): boolean;
}