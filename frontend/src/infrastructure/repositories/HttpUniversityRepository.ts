// Infrastructure: HTTP University Repository Implementation
import { University } from '../../domain/entities/University';
import type { IUniversityRepository, IConfigRepository, ISessionRepository } from '../../domain/repositories/interfaces';

export class HttpUniversityRepository implements IUniversityRepository {
  private configRepository: IConfigRepository;
  private sessionRepository: ISessionRepository;

  constructor(configRepository: IConfigRepository, sessionRepository: ISessionRepository) {
    this.configRepository = configRepository;
    this.sessionRepository = sessionRepository;
  }

  public async getAll(params?: { limit?: number; search?: string; country?: string }): Promise<University[]> {
    const baseUrl = this.configRepository.getApiBaseUrl();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.country) queryParams.append('country', params.country);

    const url = `${baseUrl}/api/universities${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    try {
      const response = await fetch(url, {
        headers: await this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch universities: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      return apiResponse.data?.map((item: any) => University.fromApiResponse(item)) || 
             apiResponse?.map((item: any) => University.fromApiResponse(item)) || [];
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
  }

  public async getById(id: number): Promise<University | null> {
    const baseUrl = this.configRepository.getApiBaseUrl();
    const url = `${baseUrl}/api/universities/${id}`;

    try {
      const response = await fetch(url, {
        headers: await this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch university: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      return apiResponse.data ? University.fromApiResponse(apiResponse.data) : 
             (apiResponse.id ? University.fromApiResponse(apiResponse) : null);
    } catch (error) {
      console.error('Error fetching university by ID:', error);
      return null;
    }
  }

  public async searchByName(query: string): Promise<University[]> {
    return await this.getAll({ search: query, limit: 50 });
  }

  public async findByDomain(domain: string): Promise<University | null> {
    const universities = await this.getAll({ search: domain, limit: 10 });
    return universities.find(u => u.matchesDomain(domain)) || null;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await this.sessionRepository.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (session) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
      headers['X-Id-Token'] = session.idToken;
    }

    return headers;
  }
}