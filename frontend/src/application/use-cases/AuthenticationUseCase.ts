// Application: Authentication Use Cases
import type { AuthSession } from '../../domain/entities/AuthSession';
import type { IAuthRepository, ISessionRepository } from '../../domain/repositories/interfaces';

export class AuthenticationUseCase {
  private authRepository: IAuthRepository;
  private sessionRepository: ISessionRepository;

  constructor(
    authRepository: IAuthRepository,
    sessionRepository: ISessionRepository
  ) {
    this.authRepository = authRepository;
    this.sessionRepository = sessionRepository;
  }

  public async signIn(email: string, password: string): Promise<AuthSession> {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Authenticate user
    const session = await this.authRepository.signIn(email, password);
    
    // Save session
    await this.sessionRepository.saveSession(session);
    
    return session;
  }

  public async signUp(userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): Promise<void> {
    // Validate input
    this.validateSignUpData(userData);

    // Register user
    await this.authRepository.signUp(userData);
  }

  public async confirmSignUp(email: string, code: string): Promise<AuthSession> {
    if (!email || !code) {
      throw new Error('Email and confirmation code are required');
    }

    // Confirm registration
    const session = await this.authRepository.confirmSignUp(email, code);
    
    // Save session
    await this.sessionRepository.saveSession(session);
    
    return session;
  }

  public async forgotPassword(email: string): Promise<void> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    await this.authRepository.forgotPassword(email);
  }

  public async confirmForgotPassword(
    email: string, 
    code: string, 
    newPassword: string
  ): Promise<void> {
    if (!email || !code || !newPassword) {
      throw new Error('Email, confirmation code, and new password are required');
    }

    if (!this.isValidPassword(newPassword)) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    await this.authRepository.confirmForgotPassword(email, code, newPassword);
  }

  public async resendConfirmationCode(email: string): Promise<void> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    await this.authRepository.resendConfirmationCode(email);
  }

  public async getCurrentSession(): Promise<AuthSession | null> {
    // Try to get session from storage first
    const storedSession = await this.sessionRepository.getSession();
    
    if (storedSession && storedSession.isValid()) {
      return storedSession;
    }

    // If no valid stored session, try to get current session from auth provider
    const currentSession = await this.authRepository.getCurrentSession();
    
    if (currentSession && currentSession.isValid()) {
      await this.sessionRepository.saveSession(currentSession);
      return currentSession;
    }

    return null;
  }

  public async signOut(): Promise<void> {
    // Clear stored session
    await this.sessionRepository.clearSession();
    
    // Sign out from auth provider
    await this.authRepository.signOut();
  }

  public async refreshSession(): Promise<AuthSession | null> {
    const currentSession = await this.sessionRepository.getSession();
    
    if (!currentSession) {
      return null;
    }

    try {
      const newSession = await this.authRepository.refreshSession(currentSession.refreshToken);
      await this.sessionRepository.saveSession(newSession);
      return newSession;
    } catch (error) {
      // Refresh failed, clear session
      await this.sessionRepository.clearSession();
      return null;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, with uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  private validateSignUpData(userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): void {
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Valid email is required');
    }

    if (!userData.password || !this.isValidPassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    if (!userData.givenName || userData.givenName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!userData.familyName || userData.familyName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    if (!userData.birthdate) {
      throw new Error('Birthdate is required');
    }

    // Validate birthdate format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(userData.birthdate)) {
      throw new Error('Birthdate must be in YYYY-MM-DD format');
    }

    // Validate age (must be at least 13 years old)
    const birthDate = new Date(userData.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      // Birthday hasn't occurred this year yet
    }

    if (age < 13) {
      throw new Error('You must be at least 13 years old to register');
    }
  }
}