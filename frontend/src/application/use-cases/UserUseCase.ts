// Application: User Use Cases
import type { User } from '../../domain/entities/User';
import type { University } from '../../domain/entities/University';
import type { IUserRepository, ISessionRepository } from '../../domain/repositories/interfaces';

export class UserUseCase {
  private userRepository: IUserRepository;
  private sessionRepository: ISessionRepository;

  constructor(
    userRepository: IUserRepository,
    sessionRepository: ISessionRepository
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
  }

  public async getCurrentUser(): Promise<User | null> {
    // Check if user is authenticated
    const session = await this.sessionRepository.getSession();
    if (!session || !session.isValid()) {
      return null;
    }

    try {
      return await this.userRepository.getCurrentUser();
    } catch (error) {
      // If there's an error getting user (e.g., 401), clear the session
      if (error instanceof Error && error.message.includes('401')) {
        await this.sessionRepository.clearSession();
      }
      return null;
    }
  }

  public async getUserWithUniversity(userId?: string): Promise<{
    user: User;
    university: University | null;
  } | null> {
    // Check if user is authenticated
    const session = await this.sessionRepository.getSession();
    if (!session || !session.isValid()) {
      return null;
    }

    try {
      // Use current user if no specific userId provided
      const targetUserId = userId || session.user.sub;
      
      const result = await this.userRepository.getUserUniversity(targetUserId);
      return result;
    } catch (error) {
      // If there's an error getting user (e.g., 401), clear the session
      if (error instanceof Error && error.message.includes('401')) {
        await this.sessionRepository.clearSession();
      }
      return null;
    }
  }

  public async authenticateAndGetUser(email: string): Promise<{
    user: User;
    university: University | null;
    isNewUser: boolean;
  } | null> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    try {
      const result = await this.userRepository.authenticateUser(email);
      return result;
    } catch (error) {
      // Log the error but don't throw it
      console.error('User authentication failed:', error);
      return null;
    }
  }

  public async getCurrentUserProfile(): Promise<{
    user: User;
    university: University | null;
    sessionInfo: {
      email: string;
      isEmailVerified: boolean;
      lastLoginAt: Date;
    };
  } | null> {
    const session = await this.sessionRepository.getSession();
    if (!session || !session.isValid()) {
      return null;
    }

    const userWithUniversity = await this.getUserWithUniversity();
    if (!userWithUniversity) {
      return null;
    }

    return {
      user: userWithUniversity.user,
      university: userWithUniversity.university,
      sessionInfo: {
        email: session.user.email,
        isEmailVerified: true, // Assume verified if session exists
        lastLoginAt: new Date() // Could be tracked in session
      }
    };
  }

  public async isUserAuthenticated(): Promise<boolean> {
    const session = await this.sessionRepository.getSession();
    return session !== null && session.isValid();
  }

  public async getUserEmailFromSession(): Promise<string | null> {
    const session = await this.sessionRepository.getSession();
    return session?.user.email || null;
  }

  public async getUserIdFromSession(): Promise<string | null> {
    const session = await this.sessionRepository.getSession();
    return session?.user.sub || null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}