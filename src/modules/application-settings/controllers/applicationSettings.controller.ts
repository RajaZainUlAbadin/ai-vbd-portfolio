import { Request, Response, NextFunction } from 'express';
import { ApplicationSettingsService } from '../applicationSettings.service';
import { LeadProvider } from '@/shared/constants';
import { IApplicationSettings } from '../applicationSettings.interface';

export class ApplicationSettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await ApplicationSettingsService.getSettings();

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updates = req.body;

      const settings = await ApplicationSettingsService.updateSettings(updates);

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async setAcquisitionEnabled(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: '`enabled` must be a boolean',
        });
      }

      await ApplicationSettingsService.setAcquisitionEnabled(enabled);

      res.status(200).json({
        success: true,
        message: `Acquisition ${enabled ? 'enabled' : 'disabled'}`,
        data: {
          acquisition: {
            enabled,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async setAcquisitionProviderEnabled(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { provider } = req.params;
      const { enabled } = req.body;

      if (!Object.values(LeadProvider).includes(provider as LeadProvider)) {
        return res.status(400).json({
          success: false,
          message: `Invalid acquisition provider: ${provider}`,
        });
      }

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: '`enabled` must be a boolean',
        });
      }

      await ApplicationSettingsService.setAcquisitionProviderEnabled(
        provider as LeadProvider,
        enabled,
      );

      res.status(200).json({
        success: true,
        message: `Acquisition provider ${provider} ${
          enabled ? 'enabled' : 'disabled'
        }`,
        data: {
          provider,
          enabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async setExecutionProviderEnabled(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { provider } = req.params;
      const { enabled } = req.body;

      if (!Object.values(LeadProvider).includes(provider as LeadProvider)) {
        return res.status(400).json({
          success: false,
          message: `Invalid execution provider: ${provider}`,
        });
      }

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: '`enabled` must be a boolean',
        });
      }

      await ApplicationSettingsService.setExecutionProviderEnabled(
        provider as LeadProvider,
        enabled,
      );

      res.status(200).json({
        success: true,
        message: `Execution provider ${provider} ${
          enabled ? 'enabled' : 'disabled'
        }`,
        data: {
          provider,
          enabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async setOutreachEnabled(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: '`enabled` must be a boolean',
        });
      }

      await ApplicationSettingsService.setOutreachEnabled(enabled);

      res.status(200).json({
        success: true,
        message: `Outreach ${enabled ? 'enabled' : 'disabled'}`,
        data: {
          outreach: enabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async setFollowupsEnabled(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: '`enabled` must be a boolean',
        });
      }

      await ApplicationSettingsService.setFollowupsEnabled(enabled);

      res.status(200).json({
        success: true,
        message: `Followups ${enabled ? 'enabled' : 'disabled'}`,
        data: {
          followups: enabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
