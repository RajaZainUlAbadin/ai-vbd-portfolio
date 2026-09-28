import { Request, Response, NextFunction } from 'express';
import { AcquisitionService } from './acquisition.service';

export class AcquisitionController {
  static async importLeads(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'CSV or Excel file is required',
        });
      }

      const result = await AcquisitionService.importLeadsFromFile(
        req.file.path,
        req.file.originalname,
      );

      return res.status(200).json({
        success: true,
        message: 'Lead import completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
