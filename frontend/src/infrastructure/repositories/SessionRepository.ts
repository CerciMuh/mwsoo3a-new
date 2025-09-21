// Infrastructure: Session Repository
import { AuthSession } from '../../domain/entities/AuthSession';
import type { ISessionRepository, IStorageRepository } from '../../domain/repositories/interfaces';

export class SessionRepository implements ISessionRepository {
  private storage: IStorageRepository;
  private readonly SESSION_KEY = 'mwsoo3a_auth_session';

  constructor(storage: IStorageRepository) {
    this.storage = storage;
  }

  public async saveSession(session: AuthSession): Promise<void> {
    const sessionData = {
      accessToken: session.accessToken,
      idToken: session.idToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      user: session.user
    };

    await this.storage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }

  public async getSession(): Promise<AuthSession | null> {
    const sessionDataRaw = await this.storage.getItem<string>(this.SESSION_KEY);
    
    if (!sessionDataRaw) {
      return null;
    }

    try {
      const sessionData = JSON.parse(sessionDataRaw);
      
      // Validate session data structure
      if (!this.isValidSessionData(sessionData)) {
        await this.clearSession();
        return null;
      }

      // Check if session is expired
      if (sessionData.expiresAt <= Date.now()) {
        await this.clearSession();
        return null;
      }

      // Reconstruct AuthSession from stored data
      const session = AuthSession.create({
        accessToken: sessionData.accessToken,
        idToken: sessionData.idToken,
        refreshToken: sessionData.refreshToken,
        expiresIn: Math.floor((sessionData.expiresAt - Date.now()) / 1000),
        tokenPayload: sessionData.user
      });

      return session;
    } catch (error) {
      // Invalid JSON or other parsing error
      await this.clearSession();
      return null;
    }
  }

  public async clearSession(): Promise<void> {
    await this.storage.removeItem(this.SESSION_KEY);
  }

  public async isSessionValid(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  private isValidSessionData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.accessToken === 'string' &&
      typeof data.idToken === 'string' &&
      typeof data.refreshToken === 'string' &&
      typeof data.expiresAt === 'number' &&
      data.user &&
      typeof data.user === 'object'
    );
  }
}