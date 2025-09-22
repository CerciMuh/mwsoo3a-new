// Dependency Injection Container
import * as fs from 'fs';
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
import { DynamoDbUserRepository } from '../repositories/DynamoDbUserRepository';
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
    // Use DynamoDB for Users in all environments
    const userRepository: IUserRepository = new DynamoDbUserRepository(process.env.DYNAMO_USERS_TABLE || 'Users');
    this.services.set('userRepository', userRepository);

    const universitiesDataPath = this.resolveUniversitiesDataPath();
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
    // No-op: using DynamoDB which does not require explicit cleanup
  }

  private resolveUniversitiesDataPath(): string {
    const envPath = process.env.UNIVERSITIES_DATA_PATH || process.env.UNIVERSITIES_JSON_PATH;
    const candidatePaths: string[] = [];

    if (envPath) {
      if (path.isAbsolute(envPath)) {
        candidatePaths.push(envPath);
      } else {
        candidatePaths.push(path.resolve(process.cwd(), envPath));
        candidatePaths.push(path.resolve(__dirname, '../../../', envPath));
      }
    }

    // Default locations to try when env vars are not provided
    candidatePaths.push(path.resolve(process.cwd(), 'world_universities.json'));
    candidatePaths.push(path.resolve(process.cwd(), '../world_universities.json'));
    candidatePaths.push(path.resolve(process.cwd(), '../frontend/public/world_universities.json'));
    candidatePaths.push(path.resolve(__dirname, '../../../world_universities.json'));
    candidatePaths.push(path.resolve(__dirname, '../../../../frontend/public/world_universities.json'));

    const resolvedPath = candidatePaths.find(candidate => fs.existsSync(candidate));

    // If not found, return empty string; repository will handle absence gracefully
    return resolvedPath || '';
  }
}
