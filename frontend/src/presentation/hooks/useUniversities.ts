// Presentation: Universities Hook
import { useState, useEffect, useCallback } from 'react';
import type { University } from '../../domain/entities/University';
import { DIContainer } from '../../application';

interface UniversitiesState {
  universities: University[];
  currentUniversity: University | null;
  searchResults: University[];
  isLoading: boolean;
  error: string | null;
}

interface UniversitiesActions {
  getAllUniversities: (params?: { limit?: number; search?: string; country?: string }) => Promise<void>;
  getUniversityById: (id: number) => Promise<University | null>;
  searchUniversities: (query: string) => Promise<void>;
  findUniversityByEmail: (email: string) => Promise<University | null>;
  getUniversitiesByCountry: (country: string) => Promise<void>;
  validateUniversityForUser: (email: string) => Promise<{
    university: University | null;
    isValidInstitutionalEmail: boolean;
    suggestedUniversities: University[];
  }>;
  clearError: () => void;
  clearSearch: () => void;
}

export function useUniversities(): UniversitiesState & UniversitiesActions {
  const [state, setState] = useState<UniversitiesState>({
    universities: [],
    currentUniversity: null,
    searchResults: [],
    isLoading: false,
    error: null
  });

  const container = DIContainer.getInstance();
  const universityUseCase = container.getUniversityUseCase();

  const getAllUniversities = useCallback(async (params?: {
    limit?: number;
    search?: string;
    country?: string;
  }): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const universities = await universityUseCase.getAllUniversities(params);

      setState(prev => ({
        ...prev,
        universities,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load universities',
        isLoading: false
      }));
    }
  }, [universityUseCase]);

  const getUniversityById = useCallback(async (id: number): Promise<University | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const university = await universityUseCase.getUniversityById(id);

      setState(prev => ({
        ...prev,
        currentUniversity: university,
        isLoading: false
      }));

      return university;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load university',
        isLoading: false
      }));
      return null;
    }
  }, [universityUseCase]);

  const searchUniversities = useCallback(async (query: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const searchResults = await universityUseCase.searchUniversitiesByName(query);

      setState(prev => ({
        ...prev,
        searchResults,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false
      }));
    }
  }, [universityUseCase]);

  const findUniversityByEmail = useCallback(async (email: string): Promise<University | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const university = await universityUseCase.findUniversityByEmailDomain(email);

      setState(prev => ({
        ...prev,
        currentUniversity: university,
        isLoading: false
      }));

      return university;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to find university',
        isLoading: false
      }));
      return null;
    }
  }, [universityUseCase]);

  const getUniversitiesByCountry = useCallback(async (country: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const universities = await universityUseCase.getUniversitiesByCountry(country);

      setState(prev => ({
        ...prev,
        universities,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load universities by country',
        isLoading: false
      }));
    }
  }, [universityUseCase]);

  const validateUniversityForUser = useCallback(async (email: string): Promise<{
    university: University | null;
    isValidInstitutionalEmail: boolean;
    suggestedUniversities: University[];
  }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await universityUseCase.validateUniversityForUser(email);

      setState(prev => ({
        ...prev,
        currentUniversity: result.university,
        searchResults: result.suggestedUniversities,
        isLoading: false
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'University validation failed',
        isLoading: false
      }));
      
      return {
        university: null,
        isValidInstitutionalEmail: false,
        suggestedUniversities: []
      };
    }
  }, [universityUseCase]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSearch = useCallback((): void => {
    setState(prev => ({ ...prev, searchResults: [] }));
  }, []);

  // Load popular universities on mount
  useEffect(() => {
    getAllUniversities({ limit: 50 });
  }, [getAllUniversities]);

  return {
    ...state,
    getAllUniversities,
    getUniversityById,
    searchUniversities,
    findUniversityByEmail,
    getUniversitiesByCountry,
    validateUniversityForUser,
    clearError,
    clearSearch
  };
}