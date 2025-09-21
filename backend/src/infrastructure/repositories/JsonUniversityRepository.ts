// Infrastructure Layer - University Repository Implementation
import * as fs from 'fs';
import { University } from '../../domain/entities/University';
import { IUniversityRepository } from '../../domain/repositories/interfaces';

interface UniversityData {
  name: string;
  country: string;
  alpha_two_code: string;
  'state-province'?: string;
  domains: string[];
  web_pages: string[];
}

export class JsonUniversityRepository implements IUniversityRepository {
  private universities: University[] = [];
  private dataLoaded = false;

  constructor(private dataFilePath: string) {}

  private async loadData(): Promise<void> {
    if (this.dataLoaded) return;

    try {
      const data = fs.readFileSync(this.dataFilePath, 'utf-8');
      const universityData: UniversityData[] = JSON.parse(data);
      
      this.universities = universityData.map((data, index) => 
        University.fromData(
          index + 1, // Use array index + 1 as ID
          data.name,
          data.country,
          data.alpha_two_code,
          data.domains,
          data.web_pages,
          data['state-province']
        )
      );
      
      this.dataLoaded = true;
    } catch (error) {
      throw new Error(`Failed to load university data: ${error}`);
    }
  }

  public async findById(id: number): Promise<University | null> {
    await this.loadData();
    return this.universities.find(u => u.id === id) || null;
  }

  public async findByDomain(domain: string): Promise<University | null> {
    await this.loadData();
    return this.universities.find(u => u.matchesDomain(domain)) || null;
  }

  public async findAll(params?: { limit?: number; offset?: number }): Promise<University[]> {
    await this.loadData();
    
    const offset = params?.offset || 0;
    const limit = params?.limit;
    
    let result = this.universities.slice(offset);
    
    if (limit) {
      result = result.slice(0, limit);
    }
    
    return result;
  }

  public async search(params: { 
    name?: string; 
    country?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<University[]> {
    await this.loadData();
    
    let filtered = this.universities;
    
    if (params.name) {
      const searchTerm = params.name.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.country) {
      const searchCountry = params.country.toLowerCase();
      filtered = filtered.filter(u => 
        u.country.toLowerCase().includes(searchCountry)
      );
    }
    
    const offset = params.offset || 0;
    const limit = params.limit;
    
    let result = filtered.slice(offset);
    
    if (limit) {
      result = result.slice(0, limit);
    }
    
    return result;
  }
}