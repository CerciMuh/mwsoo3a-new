// Application: Dependency Injection Container
import type {
  IUserRepository,
  IUniversityRepository,
  IAuthRepository,
  ISessionRepository,
  IStorageRepository,
  IConfigRepository
} from '../domain/repositories/interfaces';

import {
  LocalStorageRepository,
  EnvConfigRepository,
  HttpUserRepository,
  HttpUniversityRepository,
  CognitoAuthRepository,
  SessionRepository
} from '../infrastructure/repositories';

import {
  AuthenticationUseCase,
  UniversityUseCase,
  UserUseCase
} from './use-cases';

export class DIContainer {
  private static instance: DIContainer;
  
  // Repositories
  private storageRepository!: IStorageRepository;
  private configRepository!: IConfigRepository;
  private sessionRepository!: ISessionRepository;
  private authRepository!: IAuthRepository;
  private userRepository!: IUserRepository;
  private universityRepository!: IUniversityRepository;
  
  // Use Cases
  private authenticationUseCase!: AuthenticationUseCase;
  private universityUseCase!: UniversityUseCase;
  private userUseCase!: UserUseCase;

  private constructor() {
    this.initializeRepositories();
    this.initializeUseCases();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeRepositories(): void {
    // Infrastructure layer dependencies
    this.storageRepository = new LocalStorageRepository();
    this.configRepository = new EnvConfigRepository();
    this.sessionRepository = new SessionRepository(this.storageRepository);
    
    // Auth repository depends on config
    this.authRepository = new CognitoAuthRepository(this.configRepository);
    
    // HTTP repositories depend on config and session
    this.userRepository = new HttpUserRepository(this.configRepository, this.sessionRepository);
    this.universityRepository = new HttpUniversityRepository(this.configRepository, this.sessionRepository);
  }

  private initializeUseCases(): void {
    // Application layer dependencies
    this.authenticationUseCase = new AuthenticationUseCase(
      this.authRepository,
      this.sessionRepository
    );
    
    this.universityUseCase = new UniversityUseCase(
      this.universityRepository
    );
    
    this.userUseCase = new UserUseCase(
      this.userRepository,
      this.sessionRepository
    );
  }

  // Repository getters
  public getStorageRepository(): IStorageRepository {
    return this.storageRepository;
  }

  public getConfigRepository(): IConfigRepository {
    return this.configRepository;
  }

  public getSessionRepository(): ISessionRepository {
    return this.sessionRepository;
  }

  public getAuthRepository(): IAuthRepository {
    return this.authRepository;
  }

  public getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  public getUniversityRepository(): IUniversityRepository {
    return this.universityRepository;
  }

  // Use case getters
  public getAuthenticationUseCase(): AuthenticationUseCase {
    return this.authenticationUseCase;
  }

  public getUniversityUseCase(): UniversityUseCase {
    return this.universityUseCase;
  }

  public getUserUseCase(): UserUseCase {
    return this.userUseCase;
  }

  // Utility method to reset container (useful for testing)
  public static reset(): void {
    DIContainer.instance = new DIContainer();
  }

  // Health check method
  public async healthCheck(): Promise<{
    storage: boolean;
    config: boolean;
    session: boolean;
  }> {
    try {
      // Test storage
      await this.storageRepository.setItem('health_check', 'test');
      await this.storageRepository.removeItem('health_check');
      
      // Test config
      const apiUrl = this.configRepository.getApiBaseUrl();
      const cognitoConfig = this.configRepository.getCognitoConfig();
      
      // Test session
      await this.sessionRepository.isSessionValid();
      
      return {
        storage: true,
        config: !!apiUrl && !!cognitoConfig.userPoolId,
        session: true
      };
    } catch (error) {
      console.error('DIContainer health check failed:', error);
      return {
        storage: false,
        config: false,
        session: false
      };
    }
  }
}