// Domain Entity: Authentication Session
export class AuthSession {
  public readonly accessToken: string;
  public readonly idToken: string;
  public readonly refreshToken: string;
  public readonly expiresAt: number;
  public readonly user: {
    sub: string;
    email: string;
    given_name?: string;
    family_name?: string;
  };

  constructor(
    accessToken: string,
    idToken: string,
    refreshToken: string,
    expiresAt: number,
    user: {
      sub: string;
      email: string;
      given_name?: string;
      family_name?: string;
    }
  ) {
    this.accessToken = accessToken;
    this.idToken = idToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.user = user;
  }

  public isExpired(): boolean {
    return Date.now() >= this.expiresAt;
  }

  public isValid(): boolean {
    return !this.isExpired() && this.accessToken.length > 0;
  }

  public getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'X-Id-Token': this.idToken
    };
  }

  public static create(cognitoResult: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenPayload: {
      sub: string;
      email: string;
      given_name?: string;
      family_name?: string;
    };
  }): AuthSession {
    const expiresAt = Date.now() + (cognitoResult.expiresIn * 1000);
    
    return new AuthSession(
      cognitoResult.accessToken,
      cognitoResult.idToken,
      cognitoResult.refreshToken,
      expiresAt,
      cognitoResult.tokenPayload
    );
  }
}