// Infrastructure: HTTP User Repository Implementation
import { User } from '../../domain/entities/User';
import { University } from '../../domain/entities/University';
import type { IUserRepository, IConfigRepository, ISessionRepository } from '../../domain/repositories/interfaces';

export class HttpUserRepository implements IUserRepository {
  private configRepository: IConfigRepository;
  private sessionRepository: ISessionRepository;

  constructor(configRepository: IConfigRepository, sessionRepository: ISessionRepository) {
    this.configRepository = configRepository;
    this.sessionRepository = sessionRepository;
  }

  public async getCurrentUser(): Promise<User | null> {
    const session = await this.sessionRepository.getSession();
    if (!session) return null;

    return User.fromAuthToken(session.user);
  }

  public async getUserUniversity(userId: string): Promise<{ user: User; university: University | null }> {
    const session = await this.sessionRepository.getSession();
    if (!session) {
      throw new Error('No authenticated session found');
    }

    const user = User.fromAuthToken(session.user);

    try {
      const baseUrl = this.configRepository.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/users/${userId}/university`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Id-Token': session.idToken
        }
      });

      if (response.ok) {
        const apiResponse = await response.json();
        const data = apiResponse.data || apiResponse; // Handle both old and new format
        const university = data.university ? University.fromApiResponse(data.university) : null;
        return { user, university };
      }
    } catch (error) {
      console.warn('Failed to fetch university from backend:', error);
    }

    // Fallback when backend is unavailable
    return { user, university: null };
  }

  public async authenticateUser(email: string): Promise<{ user: User; university: University | null; isNewUser: boolean }> {
    const session = await this.sessionRepository.getSession();
    if (!session) {
      throw new Error('No authenticated session found');
    }

    const user = User.fromAuthToken(session.user);

    try {
      const baseUrl = this.configRepository.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/users/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Id-Token': session.idToken
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const apiResponse = await response.json();
        const data = apiResponse.data || apiResponse; // Handle both old and new format
        const university = data.university ? University.fromApiResponse(data.university) : null;
        return { user, university, isNewUser: data.isNewUser || false };
      }
    } catch (error) {
      console.warn('Failed to authenticate with backend:', error);
    }

    // Fallback
    return { user, university: null, isNewUser: false };
  }
}