// Application Layer - Use Cases for Frontend
import { User } from '../../domain/entities/User';
import { University } from '../../domain/entities/University';
import { AuthSession } from '../../domain/entities/AuthSession';
import type { AuthDomainService } from '../../domain/services/AuthDomainService';
import type { IUserRepository, IUniversityRepository } from '../../domain/repositories/interfaces';

export interface AuthenticatedUserResult {
  user: User;
  university: University | null;
  isNewUser: boolean;
}

export class SignInUseCase {
  private authDomainService: AuthDomainService;

  constructor(authDomainService: AuthDomainService) {
    this.authDomainService = authDomainService;
  }

  public async execute(email: string, password: string): Promise<{ session: AuthSession; user: User }> {
    return await this.authDomainService.signInUser(email, password);
  }
}

export class SignUpUseCase {
  private authDomainService: AuthDomainService;

  constructor(authDomainService: AuthDomainService) {
    this.authDomainService = authDomainService;
  }

  public async execute(userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): Promise<void> {
    await this.authDomainService.signUpUser(userData);
  }
}

export class GetCurrentUserUseCase {
  private authDomainService: AuthDomainService;

  constructor(authDomainService: AuthDomainService) {
    this.authDomainService = authDomainService;
  }

  public async execute(): Promise<{ session: AuthSession; user: User } | null> {
    return await this.authDomainService.getCurrentAuthenticatedUser();
  }
}

export class GetUserDashboardUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(userId: string): Promise<{ user: User; university: University | null }> {
    return await this.userRepository.getUserUniversity(userId);
  }
}

export class GetUniversitiesUseCase {
  private universityRepository: IUniversityRepository;

  constructor(universityRepository: IUniversityRepository) {
    this.universityRepository = universityRepository;
  }

  public async execute(params?: { 
    limit?: number; 
    search?: string; 
    country?: string; 
  }): Promise<University[]> {
    return await this.universityRepository.getAll(params);
  }
}

export class SearchUniversitiesUseCase {
  private universityRepository: IUniversityRepository;

  constructor(universityRepository: IUniversityRepository) {
    this.universityRepository = universityRepository;
  }

  public async execute(query: string): Promise<University[]> {
    if (query.trim().length === 0) {
      return [];
    }
    return await this.universityRepository.searchByName(query);
  }
}

export class SignOutUseCase {
  private authDomainService: AuthDomainService;

  constructor(authDomainService: AuthDomainService) {
    this.authDomainService = authDomainService;
  }

  public async execute(): Promise<void> {
    await this.authDomainService.signOut();
  }
}