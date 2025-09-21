// Domain Entity: User
export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly universityId?: number;
  public readonly givenName?: string;
  public readonly familyName?: string;
  public readonly createdAt?: Date;

  constructor(
    id: string,
    email: string,
    universityId?: number,
    givenName?: string,
    familyName?: string,
    createdAt?: Date
  ) {
    this.id = id;
    this.email = email;
    this.universityId = universityId;
    this.givenName = givenName;
    this.familyName = familyName;
    this.createdAt = createdAt;
  }

  public getFullName(): string {
    if (this.givenName && this.familyName) {
      return `${this.givenName} ${this.familyName}`;
    }
    return this.givenName || this.familyName || this.email;
  }

  public getEmailDomain(): string {
    return this.email.split('@')[1]?.toLowerCase() || '';
  }

  public hasUniversity(): boolean {
    return this.universityId !== undefined && this.universityId !== null;
  }

  public static fromAuthToken(tokenPayload: {
    sub: string;
    email: string;
    given_name?: string;
    family_name?: string;
  }): User {
    return new User(
      tokenPayload.sub,
      tokenPayload.email,
      undefined, // University will be resolved separately
      tokenPayload.given_name,
      tokenPayload.family_name
    );
  }
}