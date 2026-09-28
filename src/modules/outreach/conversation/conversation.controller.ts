import { NextFunction, Request, Response } from 'express';
import { ConversationService } from './conversationService';

export class ConversationController {
  constructor() {}

  static async getConversationList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);

      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page. Page must be a positive integer.',
        });
      }

      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit. Limit must be an integer between 1 and 100.',
        });
      }

      const settings = await ConversationService.getConversationList({
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConversationDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      if (typeof id !== 'string') {
        throw new Error('Invalid lead ID');
      }

      const data = await ConversationService.loadConversation(String(id));

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
