// Application: University Use Cases
import type { University } from '../../domain/entities/University';
import type { IUniversityRepository } from '../../domain/repositories/interfaces';

export class UniversityUseCase {
  private universityRepository: IUniversityRepository;

  constructor(universityRepository: IUniversityRepository) {
    this.universityRepository = universityRepository;
  }

  public async getAllUniversities(params?: {
    limit?: number;
    search?: string;
    country?: string;
  }): Promise<University[]> {
    // Validate parameters
    if (params?.limit && (params.limit <= 0 || params.limit > 1000)) {
      throw new Error('Limit must be between 1 and 1000');
    }

    if (params?.search && params.search.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    return await this.universityRepository.getAll(params);
  }

  public async getUniversityById(id: number): Promise<University | null> {
    if (!id || id <= 0) {
      throw new Error('Valid university ID is required');
    }

    return await this.universityRepository.getById(id);
  }

  public async searchUniversitiesByName(query: string): Promise<University[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const trimmedQuery = query.trim();
    return await this.universityRepository.searchByName(trimmedQuery);
  }

  public async findUniversityByEmailDomain(email: string): Promise<University | null> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    const domain = this.extractDomain(email);
    return await this.universityRepository.findByDomain(domain);
  }

  public async getUniversitiesByCountry(country: string): Promise<University[]> {
    if (!country || country.trim().length === 0) {
      throw new Error('Country is required');
    }

    return await this.universityRepository.getAll({ country: country.trim() });
  }

  public async getPopularUniversities(limit: number = 50): Promise<University[]> {
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await this.universityRepository.getAll({ limit });
  }

  public async validateUniversityForUser(email: string): Promise<{
    university: University | null;
    isValidInstitutionalEmail: boolean;
    suggestedUniversities: University[];
  }> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    const domain = this.extractDomain(email);
    
    // Try to find university by domain
    const university = await this.universityRepository.findByDomain(domain);
    
    if (university) {
      return {
        university,
        isValidInstitutionalEmail: true,
        suggestedUniversities: []
      };
    }

    // If no exact match, suggest similar universities based on domain keywords
    const domainParts = domain.split('.');
    const searchQueries = domainParts
      .filter(part => part.length > 2 && !['edu', 'ac', 'org', 'com', 'net'].includes(part))
      .slice(0, 2); // Take first 2 meaningful parts

    let suggestedUniversities: University[] = [];
    
    for (const query of searchQueries) {
      const suggestions = await this.universityRepository.searchByName(query);
      suggestedUniversities = [...suggestedUniversities, ...suggestions];
    }

    // Remove duplicates and limit to 10 suggestions
    const uniqueSuggestions = suggestedUniversities
      .filter((uni, index, self) => 
        index === self.findIndex(u => u.id === uni.id)
      )
      .slice(0, 10);

    return {
      university: null,
      isValidInstitutionalEmail: false,
      suggestedUniversities: uniqueSuggestions
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private extractDomain(email: string): string {
    return email.split('@')[1].toLowerCase();
  }
}