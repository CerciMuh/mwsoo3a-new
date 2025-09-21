// Infrastructure: Cognito Authentication Repository
import { AuthSession } from '../../domain/entities/AuthSession';
import type { IAuthRepository, IConfigRepository } from '../../domain/repositories/interfaces';
import { 
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirm,
  signIn as cognitoSignIn,
  forgotPassword as cognitoForgot,
  confirmForgotPassword as cognitoConfirmForgot,
  resendConfirmationCode
} from '../../auth/cognitoCustom';

export class CognitoAuthRepository implements IAuthRepository {
  constructor(_configRepository: IConfigRepository) {
    // Config repository available for future use if needed
  }

  public async signIn(email: string, password: string): Promise<AuthSession> {
    try {
      const result = await cognitoSignIn(email, password);
      
      // Extract token payload
      const tokenPayload = this.parseTokenPayload(result.idToken);
      
      return AuthSession.create({
        accessToken: result.accessToken,
        idToken: result.idToken,
        refreshToken: result.refreshToken || '',
        expiresIn: Math.floor((result.expiresAt - Date.now()) / 1000),
        tokenPayload
      });
    } catch (error) {
      throw new Error(`Sign in failed: ${error}`);
    }
  }

  public async signUp(userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): Promise<void> {
    try {
      await cognitoSignUp(userData.email, userData.password, {
        given_name: userData.givenName,
        family_name: userData.familyName,
        birthdate: userData.birthdate
      });
    } catch (error) {
      throw new Error(`Sign up failed: ${error}`);
    }
  }

  public async confirmSignUp(email: string, code: string): Promise<AuthSession> {
    try {
      // Confirm email first
      await cognitoConfirm(email, code);
      
      // After confirmation, we need to sign in to get session
      // This is a temporary workaround - in practice, you might want to
      // require the user to sign in again after confirmation
      throw new Error('Please sign in after email confirmation');
    } catch (error) {
      throw new Error(`Email confirmation failed: ${error}`);
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    try {
      await cognitoForgot(email);
    } catch (error) {
      throw new Error(`Forgot password failed: ${error}`);
    }
  }

  public async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      await cognitoConfirmForgot(email, code, newPassword);
    } catch (error) {
      throw new Error(`Password reset failed: ${error}`);
    }
  }

  public async resendConfirmationCode(email: string): Promise<void> {
    try {
      await resendConfirmationCode(email);
    } catch (error) {
      throw new Error(`Resend code failed: ${error}`);
    }
  }

  public async getCurrentSession(): Promise<AuthSession | null> {
    // Cognito doesn't provide a direct getCurrentSession method
    // This would need to be implemented with proper Cognito session management
    return null;
  }

  public async signOut(): Promise<void> {
    try {
      // Note: This requires an email parameter which we don't have here
      // In a real implementation, you'd store the current user's email
      // For now, we'll just clear local session in the session repository
      console.warn('Cognito signOut requires email - implement proper session tracking');
    } catch (error) {
      throw new Error(`Sign out failed: ${error}`);
    }
  }

  public async refreshSession(_refreshToken: string): Promise<AuthSession> {
    // This would need to be implemented with Cognito refresh logic
    throw new Error('Refresh session not implemented yet');
  }

  private parseTokenPayload(idToken: string): {
    sub: string;
    email: string;
    given_name?: string;
    family_name?: string;
  } {
    try {
      // Basic JWT parsing (in production, use a proper JWT library)
      const parts = idToken.split('.');
      const payload = JSON.parse(atob(parts[1]));
      
      return {
        sub: payload.sub,
        email: payload.email,
        given_name: payload.given_name,
        family_name: payload.family_name
      };
    } catch (error) {
      throw new Error('Failed to parse token payload');
    }
  }
}