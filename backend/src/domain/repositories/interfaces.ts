// Domain Repository Interfaces (Port - Abstract)
import { User } from '../entities/User';
import { University } from '../entities/University';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, userData: Partial<Pick<User, 'universityId'>>): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}

export interface IUniversityRepository {
  findById(id: number): Promise<University | null>;
  findByDomain(domain: string): Promise<University | null>;
  findAll(params?: { limit?: number; offset?: number }): Promise<University[]>;
  search(params: { name?: string; country?: string; limit?: number; offset?: number }): Promise<University[]>;
}

import { DynamoDbUserRepository } from './DynamoDbUserRepository';
import { JsonUniversityRepository } from './JsonUniversityRepository';
// import { SqliteUserRepository } from './SqliteUserRepository';

export {
  IConfigRepository,
  IUniversityRepository,
  IUserRepository,
  DynamoDbUserRepository,
  JsonUniversityRepository,
  // SqliteUserRepository,
};