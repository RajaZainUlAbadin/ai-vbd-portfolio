import { logger } from '@/shared/logger/logger';
import { ContextFactory } from '@/shared/context/contextFactory';
import { createTraceId } from '@/shared/utils/createTraceId';
import {
  leadQualificationQueue,
  outreachQueue,
  scrapingQueue,
} from '@/infrastructure/queues';

import { LeadsRepository } from '../lead/leads.repository';

import { ApplicationSettingsService } from './applicationSettings.service';
import { AcquisitionSchedulerService } from '../acquisition/scheduler/acquisitionScheduler.service';

import { LeadStatus } from '../lead/model/lead.status';
import { ContactType } from '../lead/lead-contact/lead-contact.types';

import { OutreachPayload } from '@/infrastructure/queues/types/outreachPayload';
import { IApplicationSettings } from './applicationSettings.interface';
import { ILead } from '../lead/model/lead.interface';
import { OutreachSchedulingService } from '../outreach/outreach-schedule/outreachScheduling.service';
import { LeadsService } from '../lead/leads.service';
import { ExecutionContext } from '@/shared/context/executionContext';
import { DomainEvent } from '@/shared/events/domainEvents';
import { ScrapingPayload } from '@/infrastructure/queues/types/scrapingPayload';
import { LeadQualificationPayload } from '@/infrastructure/queues/types/leadQualificationPayload';
import { LeadWebsiteValidator } from '../lead/utils/leadWebsiteValidator';
import { LeadProvider } from '@/shared/constants';
import { OutreachMessageRepository } from '../outreach/outreach-message/outreachMessage.repository';

export class ApplicationExecutionService {
  static async tick(): Promise<void> {
    logger.info({
      module: 'application-execution',
      message: 'Application execution tick',
      pid: process.pid,
      timestamp: new Date().toISOString(),
    });

    if (!ApplicationSettingsService.isApplicationEnabled) {
      logger.info({
        module: 'application-execution',
        message: 'Application execution disabled',
      });

      return;
    }

    const settings = await ApplicationSettingsService.getSettings();

    await this.dispatchNewLeads(settings);

    if (settings.execution.providers.CSV_IMPORT.enabled) {
      await this.dispatchCsvImportedLeads(settings);
    }

    await this.dispatchOutreach(settings);

    await this.dispatchAcquisition(settings);
  }

  private static async dispatchNewLeads(
    settings: IApplicationSettings,
  ): Promise<void> {
    const BATCH_SIZE = settings.execution.batchSize;

    const providers = ApplicationSettingsService.getEnabledExecutionProviders(
      settings,
    ).filter((p) => p !== LeadProvider.CSV_IMPORT);

    for (const provider of providers) {
      const providerSettings = settings.execution.providers[provider];

      const leads = await LeadsRepository.claimNewLeadsByProvider(
        provider,
        BATCH_SIZE,
      );

      if (!leads.length) {
        continue;
      }

      logger.info({
        module: 'application-execution',
        message: 'Dispatching new leads',
        provider,
        count: leads.length,
      });

      for (const lead of leads) {
        try {
          const acquisitionExecutionId =
            await LeadsService.getAcquisitionExecutionId(lead.id);

          const context = ContextFactory.create({
            acquisitionExecutionId: acquisitionExecutionId ?? '',
            traceId: createTraceId(),
            leadId: lead.id,
            provider: lead.provider,
          });

          await this.dispatchLeadForProcessing(lead, context);
        } catch (error) {
          await LeadsService.updateStatus(lead.id, LeadStatus.NEW);

          logger.error({
            module: 'application-execution',
            event: 'new-leads.dispatch.failed',
            message: 'Failed to dispatch lead for processing',
            leadId: lead.id,
            provider: lead.provider,
            error,
          });
        }
      }
    }
  }

  private static async dispatchOutreach(
    settings: IApplicationSettings,
  ): Promise<void> {
    if (!settings.outreach.enabled) {
      logger.info({
        message: 'Outreach execution disabled',
      });

      return;
    }

    if (!this.isWithinOutreachWindow(settings)) {
      logger.debug({
        message: 'Outreach execution skipped outside send window',
        timezone: settings.outreach.timezone,
        sendWindowStart: settings.outreach.sendWindowStart,
        sendWindowEnd: settings.outreach.sendWindowEnd,
      });

      return;
    }

    const sentToday = await OutreachMessageRepository.countSentToday();
    const scheduledToday = await LeadsRepository.countScheduledToday();

    const remainingQuota = Math.max(
      0,
      settings.outreach.dailyLimit - sentToday - scheduledToday,
    );

    if (remainingQuota <= 0) {
      logger.info({
        module: 'application-execution',
        message: 'Daily outreach quota exhausted',
        sentToday,
        scheduledToday,
        dailyLimit: settings.outreach.dailyLimit,
      });

      return;
    }

    // Should load leads with Provider !== CSV_IMPORT
    const disabledExeProviders =
      ApplicationSettingsService.getDisabledExecutionProviders(settings);

    const leads = await LeadsRepository.getPendingOutreachs(
      remainingQuota,
      disabledExeProviders,
    );

    if (!leads.length) {
      logger.info({
        module: 'application-execution',
        message: 'No pending leads available for outreach',
      });

      return;
    }

    const schedules = OutreachSchedulingService.generate(
      settings,
      leads.length,
    );

    if (!schedules.length) {
      logger.info({
        module: 'application-execution',
        message: 'Outside outreach sending window',
      });

      return;
    }

    for (let i = 0; i < leads.length; i++) {
      await this.enqueueOutreach(leads[i], schedules[i].scheduledFor);
    }
  }

  private static async enqueueOutreach(
    lead: ILead,
    scheduledFor: Date,
  ): Promise<void> {
    const emailContact = lead.contacts
      .filter(
        (contact) =>
          contact.type === ContactType.EMAIL &&
          contact.verified &&
          contact.confidence >= 70,
      )
      .sort((a, b) => b.confidence - a.confidence)[0];

    if (!emailContact) {
      await LeadsRepository.updateStatus(lead.id, LeadStatus.CONTACT_MISSING);

      logger.info({
        module: 'application-execution',
        message: 'Lead skipped, no valid email contact',
        leadId: lead.id,
      });

      return;
    }

    const acquisitionExecutionId = await LeadsService.getAcquisitionExecutionId(
      lead.id,
    );

    const context = ContextFactory.create({
      acquisitionExecutionId: acquisitionExecutionId ?? '',
      traceId: createTraceId(),
      leadId: lead.id,
      provider: lead.provider,
    });

    const delay = Math.max(0, scheduledFor.getTime() - Date.now());

    const job = await outreachQueue.add(
      'send-outreach',
      {
        context,
        data: {
          leadId: lead.id,
        } satisfies OutreachPayload,
      },
      {
        delay,
      },
    );

    try {
      await LeadsRepository.update(lead.id, {
        status: LeadStatus.OUTREACH_PENDING,
        outreachScheduledFor: scheduledFor,
      });
    } catch (error) {
      await job.remove();
      throw error;
    }

    logger.info({
      module: 'application-execution',
      message: 'Outreach queued',
      leadId: lead.id,
      recipient: emailContact.value,
      scheduledFor,
    });
  }

  private static async dispatchAcquisition(
    settings: IApplicationSettings,
  ): Promise<void> {
    try {
      if (!settings.acquisition.enabled) {
        logger.info({
          module: 'application-execution',
          message: 'Acquisition disabled',
        });

        return;
      }

      const pipelineBacklog = await LeadsRepository.countPipelineBacklog();

      if (pipelineBacklog >= settings.acquisition.maxPendingLeads) {
        logger.info({
          module: 'application-execution',
          message: 'Pending leads threshold satisfied',
          pending_leads: pipelineBacklog,
          threshold: settings.acquisition.maxPendingLeads,
        });

        return;
      }

      const provider =
        ApplicationSettingsService.getFirstActiveAcquisitionProvider(settings);

      if (!provider) {
        logger.info({
          module: 'application-execution',
          message: 'No acquisition provider enabled',
        });

        return;
      }

      logger.info({
        module: 'application-execution',
        event: 'acquisition-dispatch.provider',
        message: 'Dispatching acquisition provider',
        provider,
      });

      // unResolveed leads -> with Status: CONTACT_MISSING
      const unresolvedLeads =
        await LeadsRepository.getUnresolvedLeads(provider);

      if (unresolvedLeads >= 50) {
        logger.info({
          module: 'application-execution',
          event: 'acquisition-dispatch.provider.unresolvedLeads',
          message:
            `${unresolvedLeads} unresolved leads are pending ` +
            `with Status: CONTACT_MISSING for provider ${provider}. ` +
            `Acquisition skipped.`,
          unresolved_leads: unresolvedLeads,
          provider,
        });

        return;
      }

      logger.info({
        module: 'application-execution',
        message:
          'Pending leads below threshold, starting acquisition-scheduler',
        pending_leads: pipelineBacklog,
        threshold: settings.acquisition.maxPendingLeads,
      });

      await AcquisitionSchedulerService.run(provider);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error({
        module: 'application-execution',
        event: 'acquisition-dispatch.failed',
        message: 'Failed to dispatch acquisition',
        error: err,
        stack: err.stack,
      });

      throw err;
    }
  }

  // Exsiting leads -> Imported/Uploaded by csv
  private static async dispatchCsvImportedLeads(
    settings: IApplicationSettings,
  ): Promise<void> {
    const BATCH_SIZE = settings.execution.batchSize;
    const csvSettings = settings.execution.providers.CSV_IMPORT;

    if (!csvSettings.enabled) {
      return;
    }

    const leads = await LeadsRepository.claimNewLeadsByProvider(
      LeadProvider.CSV_IMPORT,
      BATCH_SIZE,
    );

    if (!leads.length) {
      logger.info({
        module: 'application-execution',
        message: 'No new CSV leads available',
      });

      return;
    }

    logger.info({
      module: 'application-execution',
      message: 'Dispatching CSV leads',
      count: leads.length,
    });

    for (const lead of leads) {
      const context = ContextFactory.create({
        acquisitionExecutionId: '',
        traceId: createTraceId(),
        leadId: lead.id,
        provider: lead.provider,
      });
      await this.dispatchLeadForProcessing(lead, context);
    }
  }

  static async dispatchLeadForProcessing(
    lead: ILead,
    context: ExecutionContext,
  ): Promise<void> {
    if (!lead.website || LeadWebsiteValidator.isInvalidWebsite(lead.website)) {
      await LeadsService.updateStatus(
        lead.id,
        LeadStatus.QUALIFICATION_PENDING,
      );

      await leadQualificationQueue.add(DomainEvent.LEAD_QUALIFICATION_STARTED, {
        context,
        data: {
          leadId: lead.id,
          scrapeSkipped: true,
        } satisfies LeadQualificationPayload,
      });

      logger.info({
        module: 'application-execution',
        event: 'lead.processing.qualification.queued',
        message: 'Lead has no valid website, qualification queued',
        leadId: lead.id,
        provider: lead.provider,
      });

      return;
    }

    // await LeadsService.updateStatus(lead.id, LeadStatus.SCRAPING_PENDING);

    const job = await scrapingQueue.add(DomainEvent.SCRAPING_STARTED, {
      context,
      data: {
        leadId: lead.id,
        website: lead.website,
      } satisfies ScrapingPayload,
    });

    logger.info({
      module: 'application-execution',
      event: 'lead.processing.scraping.queued',
      message: 'Lead scraping queued',
      leadId: lead.id,
      provider: lead.provider,
      jobId: job.id,
    });
  }

  private static isWithinOutreachWindow(
    settings: IApplicationSettings,
  ): boolean {
    const startTime = settings.outreach.sendWindowStart;
    const endTime = settings.outreach.sendWindowEnd;
    const timezone = settings.outreach.timezone;

    if (!startTime || !endTime || !timezone) {
      return false;
    }

    const now = new Date();

    const currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Normal window, e.g. 07:00 -> 19:00
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    // Overnight window, e.g. 22:00 -> 06:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}
