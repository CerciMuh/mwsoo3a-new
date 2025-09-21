// Domain Service: Authentication Business Logic
import { User } from '../entities/User';
import { AuthSession } from '../entities/AuthSession';
import type { IAuthRepository, IStorageRepository } from '../repositories/interfaces';

export class AuthDomainService {
  private authRepository: IAuthRepository;
  private storageRepository: IStorageRepository;

  constructor(
    authRepository: IAuthRepository,
    storageRepository: IStorageRepository
  ) {
    this.authRepository = authRepository;
    this.storageRepository = storageRepository;
  }

  public async signInUser(email: string, password: string): Promise<{ session: AuthSession; user: User }> {
    const session = await this.authRepository.signIn(email, password);
    const user = User.fromAuthToken(session.user);
    
    // Persist session
    await this.storageRepository.setItem('auth_session', session);
    await this.storageRepository.setItem('user_email', user.email);
    
    return { session, user };
  }

  public async signUpUser(userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): Promise<void> {
    await this.authRepository.signUp(userData);
  }

  public async confirmUserSignUp(email: string, code: string): Promise<{ session: AuthSession; user: User }> {
    const session = await this.authRepository.confirmSignUp(email, code);
    const user = User.fromAuthToken(session.user);
    
    // Persist session
    await this.storageRepository.setItem('auth_session', session);
    await this.storageRepository.setItem('user_email', user.email);
    
    return { session, user };
  }

  public async getCurrentAuthenticatedUser(): Promise<{ session: AuthSession; user: User } | null> {
    // Try to get session from storage first
    const storedSession = await this.storageRepository.getItem<AuthSession>('auth_session');
    
    if (storedSession && !storedSession.isExpired()) {
      const user = User.fromAuthToken(storedSession.user);
      return { session: storedSession, user };
    }

    // Try to get current session from auth provider
    const currentSession = await this.authRepository.getCurrentSession();
    if (currentSession) {
      const user = User.fromAuthToken(currentSession.user);
      
      // Update stored session
      await this.storageRepository.setItem('auth_session', currentSession);
      await this.storageRepository.setItem('user_email', user.email);
      
      return { session: currentSession, user };
    }

    // No valid session
    await this.clearAuthData();
    return null;
  }

  public async signOut(): Promise<void> {
    await this.authRepository.signOut();
    await this.clearAuthData();
  }

  public async forgotPassword(email: string): Promise<void> {
    await this.authRepository.forgotPassword(email);
  }

  public async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await this.authRepository.confirmForgotPassword(email, code, newPassword);
  }

  public async resendConfirmationCode(email: string): Promise<void> {
    await this.authRepository.resendConfirmationCode(email);
  }

  private async clearAuthData(): Promise<void> {
    await this.storageRepository.removeItem('auth_session');
    await this.storageRepository.removeItem('user_email');
    await this.storageRepository.removeItem('cognito_access_token');
    await this.storageRepository.removeItem('cognito_id_token');
    await this.storageRepository.removeItem('cognito_expires_at');
  }
}