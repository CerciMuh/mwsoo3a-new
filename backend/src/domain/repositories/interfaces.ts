// Domain Repository Interfaces (Port - Abstract)
import { User } from '../entities/User';
import { University } from '../entities/University';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: number, userData: Partial<Pick<User, 'universityId'>>): Promise<User>;
  delete(id: number): Promise<void>;
  findAll(): Promise<User[]>;
}

export interface IUniversityRepository {
  findById(id: number): Promise<University | null>;
  findByDomain(domain: string): Promise<University | null>;
  findAll(params?: { limit?: number; offset?: number }): Promise<University[]>;
  search(params: { name?: string; country?: string; limit?: number; offset?: number }): Promise<University[]>;
}