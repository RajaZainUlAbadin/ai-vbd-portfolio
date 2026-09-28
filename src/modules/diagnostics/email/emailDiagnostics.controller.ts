import { Request, Response } from 'express';
import { EmailDiagnosticsService } from './emailDiagnostics.service';

export class EmailDiagnosticsController {
  static async send(req: Request, res: Response) {
    try {
      const result = await EmailDiagnosticsService.sendTestEmail();

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  static async followup(req: Request, res: Response) {
    try {
      const { outreachId, recipient } = req.body;

      if (!outreachId) {
        return res.status(400).json({
          success: false,
          error: 'outreachId is required.',
        });
      }

      const result = await EmailDiagnosticsService.sendTestFollowup(
        outreachId,
        recipient,
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Generate an AI Reply and send it through SES.
   */
  static async response(req: Request, res: Response) {
    try {
      const { outreachMessageId, recipient } = req.body;

      if (!outreachMessageId) {
        return res.status(400).json({
          success: false,
          error: 'outreachMessageId is required.',
        });
      }

      const result = await EmailDiagnosticsService.sendTestResponse(
        outreachMessageId,
        recipient,
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Download the raw email from S3.
   */
  static async s3(req: Request, res: Response) {
    try {
      const { objectKey } = req.body;

      if (!objectKey) {
        return res.status(400).json({
          success: false,
          error: 'objectKey is required.',
        });
      }

      const result = await EmailDiagnosticsService.testS3Download(objectKey);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Parse the downloaded email.
   */
  static async parser(req: Request, res: Response) {
    try {
      const { objectKey } = req.body;

      if (!objectKey) {
        return res.status(400).json({
          success: false,
          error: 'objectKey is required.',
        });
      }

      const result = await EmailDiagnosticsService.testMailParser(objectKey);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Resolve an inbound email to its parent outreach message.
   */
  static async thread(req: Request, res: Response) {
    try {
      const { objectKey } = req.body;

      if (!objectKey) {
        return res.status(400).json({
          success: false,
          error: 'objectKey is required.',
        });
      }

      const result =
        await EmailDiagnosticsService.testThreadResolution(objectKey);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Execute handleIncomingEmail().
   */
  static async inbound(req: Request, res: Response) {
    try {
      const { objectKey } = req.body;

      if (!objectKey) {
        return res.status(400).json({
          success: false,
          error: 'objectKey is required.',
        });
      }

      const result =
        await EmailDiagnosticsService.testHandleIncomingEmail(objectKey);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Replay a complete SNS payload.
   */
  static async replay(req: Request, res: Response) {
    try {
      const payload = req.body;

      const result =
        await EmailDiagnosticsService.testReplaySnsPayload(payload);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Run the complete inbound diagnostics pipeline.
   */
  static async pipeline(req: Request, res: Response) {
    try {
      const { objectKey } = req.body;

      if (!objectKey) {
        return res.status(400).json({
          success: false,
          error: 'objectKey is required.',
        });
      }

      const result =
        await EmailDiagnosticsService.testCompleteInboundPipeline(objectKey);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
