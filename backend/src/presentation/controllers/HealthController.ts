// Presentation Layer - Health Check Controller
import { Request, Response } from 'express';

export class HealthController {
  public checkHealth = (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'mwsoo3a-api',
        version: '2.0.0'
      }
    });
  };

  public checkReadiness = (_req: Request, res: Response): void => {
    // In a real application, you would check database connectivity,
    // external service availability, etc.
    res.status(200).json({
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
          universityData: 'healthy'
        }
      }
    });
  };
}