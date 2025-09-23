// Presentation Layer - Clean Controllers with Dependency Injection
import { Request, Response } from 'express';
import { AuthenticateUserUseCase, GetUserDashboardUseCase } from '../../application/useCases';

export class UserController {
  constructor(
    private authenticateUserUseCase: AuthenticateUserUseCase,
    private getUserDashboardUseCase: GetUserDashboardUseCase
  ) {}

  public authenticateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ 
          success: false, 
          error: 'Email is required' 
        });
        return;
      }

      const result = await this.authenticateUserUseCase.execute(email);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            universityId: result.user.universityId,
            createdAt: result.user.createdAt
          },
          university: result.university ? {
            id: result.university.id,
            name: result.university.name,
            country: result.university.country,
            domain: result.university.domain
          } : null,
          isNewUser: result.isNewUser
        }
      });
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };

  public getUserDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.status(400).json({ 
          success: false, 
          error: 'User ID parameter is required' 
        });
        return;
      }

      const result = await this.getUserDashboardUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            universityId: result.user.universityId,
            createdAt: result.user.createdAt
          },
          university: result.university ? {
            id: result.university.id,
            name: result.university.name,
            country: result.university.country,
            domain: result.university.domain
          } : null
        }
      });
    } catch (error) {
      console.error('Error fetching user dashboard:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
        return;
      }

      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };
}