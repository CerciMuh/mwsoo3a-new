// Presentation Layer - Universities Controller
import { Request, Response } from 'express';
import { GetUniversitiesUseCase } from '../../application/useCases';

export class UniversitiesController {
  constructor(private getUniversitiesUseCase: GetUniversitiesUseCase) {}

  public getUniversities = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, country, limit } = req.query;
      
      const limitNumber = limit ? parseInt(limit as string) : undefined;
      if (limit && isNaN(limitNumber!)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid limit parameter' 
        });
        return;
      }

      const universities = await this.getUniversitiesUseCase.execute(
        search as string,
        country as string,
        limitNumber
      );

      res.status(200).json({
        success: true,
        data: universities.map(university => ({
          id: university.id,
          name: university.name,
          country: university.country,
          countryCode: university.countryCode,
          domain: university.domain,
          domains: university.domains,
          webPages: university.webPages,
          stateProvince: university.stateProvince
        })),
        meta: {
          count: universities.length,
          hasSearch: !!(search || country),
          filters: {
            search: search || null,
            country: country || null,
            limit: limitNumber || null
          }
        }
      });
    } catch (error) {
      console.error('Error fetching universities:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };

  public getUniversityById = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({ 
          success: false, 
          error: 'University ID parameter is required' 
        });
        return;
      }

      const universityId = parseInt(idParam);

      if (isNaN(universityId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid university ID' 
        });
        return;
      }

      // For now, we'll use the use case to get all and filter
      // In a real scenario, we'd have a specific use case for this
      const universities = await this.getUniversitiesUseCase.execute();
      const university = universities.find(u => u.id === universityId);

      if (!university) {
        res.status(404).json({ 
          success: false, 
          error: 'University not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: university.id,
          name: university.name,
          country: university.country,
          countryCode: university.countryCode,
          domain: university.domain,
          domains: university.domains,
          webPages: university.webPages,
          stateProvince: university.stateProvince
        }
      });
    } catch (error) {
      console.error('Error fetching university by ID:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };
}