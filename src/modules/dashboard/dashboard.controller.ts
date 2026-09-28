import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashbaord.service';

export class DashboardController {
  static async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await DashboardService.overview();

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async activity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.activity();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async systemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.systemHealth();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async queuesHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getQueuesHealth();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async providerPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getProviderPerformance();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
