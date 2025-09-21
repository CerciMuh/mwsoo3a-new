// Domain Entity: User
export class User {
  constructor(
    public readonly id: number | undefined,
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
      undefined, // id will be set by database
      email.toLowerCase(),
      universityId || null,
      undefined // createdAt will be set by database
    );
  }

  public static fromDatabase(id: number, email: string, universityId?: number | null, createdAt?: string): User {
    const date = createdAt ? new Date(createdAt) : undefined;
    return new User(id, email, universityId || null, date);
  }
}