// Dependency Injection Container
import Database from 'better-sqlite3';
import * as path from 'path';

// Domain Services
import { UserDomainService } from '../../domain/services/UserDomainService';

// Use Cases
import { 
  AuthenticateUserUseCase, 
  GetUniversitiesUseCase, 
  GetUserDashboardUseCase 
} from '../../application/useCases';

// Infrastructure
import { SqliteUserRepository } from '../repositories/SqliteUserRepository';
import { JsonUniversityRepository } from '../repositories/JsonUniversityRepository';

// Repository Interfaces
import { IUserRepository, IUniversityRepository } from '../../domain/repositories/interfaces';

export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeServices(): void {
    // Database
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../dev.db');
    const database = new Database(dbPath);
    this.services.set('database', database);

    // Repositories
    const userRepository: IUserRepository = new SqliteUserRepository(database);
    this.services.set('userRepository', userRepository);

    const universitiesDataPath = process.env.UNIVERSITIES_DATA_PATH || 
      path.join(__dirname, '../../../world_universities.json');
    const universityRepository: IUniversityRepository = new JsonUniversityRepository(universitiesDataPath);
    this.services.set('universityRepository', universityRepository);

    // Domain Services
    const userDomainService = new UserDomainService(userRepository, universityRepository);
    this.services.set('userDomainService', userDomainService);

    // Use Cases
    const authenticateUserUseCase = new AuthenticateUserUseCase(userDomainService);
    this.services.set('authenticateUserUseCase', authenticateUserUseCase);

    const getUniversitiesUseCase = new GetUniversitiesUseCase(universityRepository);
    this.services.set('getUniversitiesUseCase', getUniversitiesUseCase);

    const getUserDashboardUseCase = new GetUserDashboardUseCase(userDomainService);
    this.services.set('getUserDashboardUseCase', getUserDashboardUseCase);
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found in DI container`);
    }
    return service as T;
  }

  public getUserRepository(): IUserRepository {
    return this.get<IUserRepository>('userRepository');
  }

  public getUniversityRepository(): IUniversityRepository {
    return this.get<IUniversityRepository>('universityRepository');
  }

  public getUserDomainService(): UserDomainService {
    return this.get<UserDomainService>('userDomainService');
  }

  public getAuthenticateUserUseCase(): AuthenticateUserUseCase {
    return this.get<AuthenticateUserUseCase>('authenticateUserUseCase');
  }

  public getGetUniversitiesUseCase(): GetUniversitiesUseCase {
    return this.get<GetUniversitiesUseCase>('getUniversitiesUseCase');
  }

  public getUserDashboardUseCase(): GetUserDashboardUseCase {
    return this.get<GetUserDashboardUseCase>('getUserDashboardUseCase');
  }

  public cleanup(): void {
    const database = this.services.get('database') as Database.Database;
    if (database) {
      database.close();
    }
  }
}