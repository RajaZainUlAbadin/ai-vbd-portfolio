import { Request, Response } from 'express';
import { AIDiagnosticsService } from './aiDiagnostics.service';

export class AIDiagnosticsController {
  static async followup(req: Request, res: Response) {
    try {
      const { outreachId } = req.body;

      const result = await AIDiagnosticsService.generateFollowup(outreachId);
      res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
