import { Request, Response, NextFunction } from 'express';
import { OutreachService } from './outreach.service';
import { parseOutreachListQuery } from './helper/parseOutreachListQuery.helper';

export class OutreachController {
  static async getStats(_: Request, res: Response, next: NextFunction) {
    try {
      const stats = await OutreachService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOutreaches(req: Request, res: Response, next: NextFunction) {
    try {
      const options = parseOutreachListQuery(req.query);

      console.log('Options: ', options);

      const result = await OutreachService.getOutreaches(options);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Not been used
  static async getOutreachDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      console.log('Outreach details req, Id: ', id);

      if (typeof id !== 'string') {
        throw new Error('Invalid lead ID');
      }

      const data = await OutreachService.getOutreachDetail(id);
      console.log('Outreach detils: ', data);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
