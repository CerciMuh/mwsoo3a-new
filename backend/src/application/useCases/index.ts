// Application Layer - Use Cases (Orchestrates domain logic)
import { User } from '../../domain/entities/User';
import { University } from '../../domain/entities/University';
import { UserDomainService } from '../../domain/services/UserDomainService';
import { IUniversityRepository } from '../../domain/repositories/interfaces';

export interface AuthenticatedUserResult {
  user: User;
  university: University | null;
  isNewUser: boolean;
}

export class AuthenticateUserUseCase {
  constructor(private userDomainService: UserDomainService) {}

  public async execute(email: string): Promise<AuthenticatedUserResult> {
    // Check if user exists
    const existingUser = await this.userDomainService.getUserWithUniversity(
      await this.userDomainService.findOrCreateUserByEmail(email).then(u => u.id!)
    ).catch(() => null);

    if (existingUser) {
      return {
        user: existingUser.user,
        university: existingUser.university,
        isNewUser: false
      };
    }

    // Create new user
    const newUser = await this.userDomainService.findOrCreateUserByEmail(email);
    const userWithUniversity = await this.userDomainService.getUserWithUniversity(newUser.id!);

    return {
      user: userWithUniversity.user,
      university: userWithUniversity.university,
      isNewUser: true
    };
  }
}

export class GetUniversitiesUseCase {
  constructor(private universityRepository: IUniversityRepository) {}

  public async execute(search?: string, country?: string, limit?: number): Promise<University[]> {
    if (search || country) {
      const searchParams: { name?: string; country?: string; limit?: number; offset?: number } = {};
      
      if (search) searchParams.name = search;
      if (country) searchParams.country = country;
      if (limit) searchParams.limit = limit;
      
      return await this.universityRepository.search(searchParams);
    }
    
    const findAllParams: { limit?: number; offset?: number } = {};
    if (limit) findAllParams.limit = limit;
    
    return await this.universityRepository.findAll(findAllParams);
  }
}

export class GetUserDashboardUseCase {
  constructor(private userDomainService: UserDomainService) {}

  public async execute(userId: string): Promise<{ user: User; university: University | null }> {
    return await this.userDomainService.getUserWithUniversity(userId);
  }
}