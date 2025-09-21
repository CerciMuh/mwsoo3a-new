// Presentation: Authentication Hook
import { useState, useEffect, useCallback } from 'react';
import type { AuthSession } from '../../domain/entities/AuthSession';
import type { User } from '../../domain/entities/User';
import type { University } from '../../domain/entities/University';
import { DIContainer } from '../../application';

interface AuthState {
  session: AuthSession | null;
  user: User | null;
  university: University | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    university: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const container = DIContainer.getInstance();
  const authUseCase = container.getAuthenticationUseCase();
  const userUseCase = container.getUserUseCase();

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const session = await authUseCase.getCurrentSession();
      
      if (session) {
        const userProfile = await userUseCase.getCurrentUserProfile();
        
        setState(prev => ({
          ...prev,
          session,
          user: userProfile?.user || null,
          university: userProfile?.university || null,
          isAuthenticated: true,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          university: null,
          isAuthenticated: false,
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Authentication failed',
        isLoading: false
      }));
    }
  };

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const session = await authUseCase.signIn(email, password);
      const userProfile = await userUseCase.getCurrentUserProfile();

      setState(prev => ({
        ...prev,
        session,
        user: userProfile?.user || null,
        university: userProfile?.university || null,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
        isLoading: false
      }));
      throw error;
    }
  }, [authUseCase, userUseCase]);

  const signUp = useCallback(async (userData: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authUseCase.signUp(userData);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign up failed',
        isLoading: false
      }));
      throw error;
    }
  }, [authUseCase]);

  const confirmSignUp = useCallback(async (email: string, code: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const session = await authUseCase.confirmSignUp(email, code);
      const userProfile = await userUseCase.getCurrentUserProfile();

      setState(prev => ({
        ...prev,
        session,
        user: userProfile?.user || null,
        university: userProfile?.university || null,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Email confirmation failed',
        isLoading: false
      }));
      throw error;
    }
  }, [authUseCase, userUseCase]);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authUseCase.forgotPassword(email);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Password reset request failed',
        isLoading: false
      }));
      throw error;
    }
  }, [authUseCase]);

  const confirmForgotPassword = useCallback(async (
    email: string, 
    code: string, 
    newPassword: string
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authUseCase.confirmForgotPassword(email, code, newPassword);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Password reset failed',
        isLoading: false
      }));
      throw error;
    }
  }, [authUseCase]);

  const resendConfirmationCode = useCallback(async (email: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authUseCase.resendConfirmationCode(email);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Resend code failed',
        isLoading: false
      }));
      throw error;
    }
  }, [authUseCase]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authUseCase.signOut();

      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        university: null,
        isAuthenticated: false,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
        isLoading: false
      }));
    }
  }, [authUseCase]);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const newSession = await authUseCase.refreshSession();
      
      if (newSession) {
        const userProfile = await userUseCase.getCurrentUserProfile();
        
        setState(prev => ({
          ...prev,
          session: newSession,
          user: userProfile?.user || null,
          university: userProfile?.university || null,
          isAuthenticated: true
        }));
      } else {
        // Refresh failed, clear session
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          university: null,
          isAuthenticated: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        university: null,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Session refresh failed'
      }));
    }
  }, [authUseCase, userUseCase]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    confirmSignUp,
    forgotPassword,
    confirmForgotPassword,
    resendConfirmationCode,
    signOut,
    refreshSession,
    clearError
  };
}