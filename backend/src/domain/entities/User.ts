// Domain Entity: User
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly universityId: number | null,
    public readonly createdAt: Date | undefined
  ) {}

  public hasUniversity(): boolean {
    return this.universityId !== null;
  }

  public getEmailDomain(): string {
    return this.email.split('@')[1]?.toLowerCase() || '';
  }

  public static create(email: string, universityId?: number): User {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    return new User(
      '', // id will be set by database
      email.toLowerCase(),
      universityId || null,
      undefined // createdAt will be set by database
    );
  }

  public static fromDatabase(id: string, email: string, universityId?: number | null, createdAt?: string | Date): User {
    const created = createdAt ? (typeof createdAt === 'string' ? new Date(createdAt) : createdAt) : undefined;
    return new User(id, email, universityId || null, created);
  }
}