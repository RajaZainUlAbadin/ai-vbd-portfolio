import { Express, Request, Response } from 'express';
import testingRoutes from '@/modules/testing/testing.routes';
import outreachWebhookRoutes from '@/modules/outreach/outreach-webhook/outreachWebhook.routes';
import emailDiagnosticsRoutes from '@/modules/diagnostics/email/emailDiagnostics.routes';
import acquisitionRoutes from '@/modules/acquisition/acquisition.routes';
import applicationSettingsRoutes from '@/modules/application-settings/routes/applicationSettings.routes';
import dashboardRoutes from '@/modules/dashboard/dashboard.routes';
import outreachRoutes from '@/modules/outreach/outreach/outreach.routes';
import LeadsRoutes from '@/modules/lead/leads.routes';
import conversationRoutes from '@/modules/outreach/conversation/conversation.routes';

export const registerRoutes = (app: Express) => {
  app.get('/health', (_: Request, res: Response) => {
    res.json({
      status: 'ok',
    });
  });

  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/leads', LeadsRoutes);
  app.use('/api/acquisition', acquisitionRoutes);
  app.use('/api/outreach', outreachRoutes);
  app.use('/api/conversation', conversationRoutes);
  app.use('/api/webhooks', outreachWebhookRoutes);
  app.use('/api/settings', applicationSettingsRoutes);
  app.use('/diagnostics/email', emailDiagnosticsRoutes);
  app.use('/testing', testingRoutes);
};
