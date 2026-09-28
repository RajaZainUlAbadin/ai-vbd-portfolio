import { Request, Response, NextFunction } from 'express';
import { LeadsService } from './leads.service';
import { LeadStatus } from './model/lead.status';
import { LeadProvider } from '@/shared/constants';
import { logger } from '@/shared/logger/logger';

export class LeadsController {
  constructor() {}

  static async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 20);

      const rawStatus = req.query.status;
      const rawProvider = req.query.provider;

      const status =
        typeof rawStatus === 'string' && rawStatus.length > 0
          ? rawStatus.includes(',')
            ? rawStatus.split(',')
            : rawStatus
          : undefined;

      const provider =
        typeof rawProvider === 'string' && rawProvider.length > 0
          ? rawProvider.includes(',')
            ? rawProvider.split(',')
            : rawProvider
          : undefined;

      const data = await LeadsService.getLeads({
        page,
        limit,
        status: status as LeadStatus | LeadStatus[] | undefined,
        provider: provider as LeadProvider | LeadProvider[] | undefined,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (typeof id !== 'string') {
        throw new Error('Invalid lead ID');
      }

      const data = await LeadsService.getLead_dashboardObject(id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLeadWithTimeline(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      if (typeof id !== 'string') {
        throw new Error('Invalid lead ID');
      }

      const data = await LeadsService.getLeadWithTimeline(id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async aiAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (typeof id !== 'string') {
        throw new Error('Invalid lead ID');
      }

      const data = await LeadsService.getAIAnalysis(id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async scrapeResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (typeof id !== 'string') {
        throw new Error('Invalid lead ID');
      }

      const data = await LeadsService.getScrapeResult(id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async outreachSequence(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      if (typeof id !== 'string') {
        throw new Error('Invalid lead ID');
      }

      const data = await LeadsService.getOutreachSequence(id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async newLeadFromWebsite(req: Request, res: Response) {
    try {
      const body = req.body;

      const result = await LeadsService.processLeadFromWebsite(body);

      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        leadId: result.leadId,
      });
    } catch (error) {
      logger.info(error, 'Lead submission failed');
      return Response.json(
        {
          success: false,
          message: 'Unable to process request',
        },
        { status: 500 },
      );
    }
  }

  static async updateAnalysisMessage() {}
  static async updateLeadConact() {}

  // async migrateLeadContacts() {
  //   return LeadsService.migrateLeadContacts();
  // }
}
