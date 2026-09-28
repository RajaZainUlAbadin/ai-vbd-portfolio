import { Request, Response, Router } from 'express';
import { ProviderManager } from '@/providers/lead-sources/ProviderManager';
import { leadAcquisitionQueue } from '@/infrastructure/queues';
import { createTraceId } from '@/shared/utils/createTraceId';
import { LeadsRepository } from '../lead/leads.repository';
import { LeadStatus } from '../lead/model/lead.status';
import { ScrapeRawResult } from '@/providers/scrapers/base/ScraperProvider';
import { ScrapingService } from '../scraping/scraping.service';
import { EmailService } from '@/providers/communication/email/EmailService';
import { ContextFactory } from '@/shared/context/contextFactory';
import { BaseQueueJob } from '@/infrastructure/queues/types/baseQueueJob';
import { LeadAcquisitionPayload } from '@/infrastructure/queues/types/leadAcquisitionPayload';
import { AcquisitionExecutionRepository } from '../acquisition/acquisition-execution/acquisitionExecution.repository';
import { QualificationService } from '../qualification/qualfication.service';
import { AIService } from '../ai/ai.service';
import { ScrapeResultModel } from '../scraping/model/scrapeResult.model';
import { ScrapeRepository } from '../scraping/scrape.repository';
import { OutreachService } from '../outreach/outreach/outreach.service';

const router = Router();

router.get('/health', (_, res: Response) => {
  res.json({
    status: 'ok',
  });
});

router.get('/test-queue', async (_: Request, res: Response) => {
  try {
    const asd = await ProviderManager.fetchLeads('mock');

    res.json({
      success: true,
      data: asd,
    });
  } catch (error) {
    console.error('TEST QUEUE ERROR:', error);

    return res.status(500).json({
      success: false,
      error,
    });
  }
});

router.post('/test-pipeline', async (_: Request, res: Response) => {
  const context = ContextFactory.create({
    provider: 'mock',
  });

  await leadAcquisitionQueue.add('test-lead-acquisition', {
    context,
    data: {
      sourceId: 'manual',
      provider: 'mock',
      query: 'car rentals dubai',
      location: 'Dubai',
    },
  } satisfies BaseQueueJob<LeadAcquisitionPayload>);

  return res.json({
    success: true,
  });
});

router.post('/google-leads', async (_: Request, res: Response) => {
  // // Queue testing
  // await leadAcquisitionQueue.add('test-google-acquisition', {
  //   provider: 'google-maps',
  //   query: 'restaurants',
  //   location: 'Dubai Marina',
  //   traceId: createTraceId(),
  // });

  // // Testing Google Maps provider directly
  // const provider = 'google-maps';
  // const query = 'restaurants';
  // const location = 'Dubai Marina';
  // const traceId = createTraceId();

  // const providerResult = await ProviderManager.fetchLeads(provider, {
  //   query,
  //   location,
  // });

  // logger.info({
  //   module: 'lead-acquisition',
  //   message: 'Leads acquired successfully',
  //   provider: provider,
  //   totalLeads: providerResult.normalizedResults.length,
  //   traceId,
  // });

  // const newLeads = await AcquisitionService.processResults({
  //   provider,
  //   query,
  //   location,
  //   traceId,
  //   rawResponse: providerResult.rawResponse,
  //   results: providerResult.normalizedResults,
  // });

  // Getting leads from database and enqueueing scraping jobs
  let newLeads;
  newLeads = await LeadsRepository.getAll();

  newLeads = newLeads
    .filter((lead) => lead.status === LeadStatus.SCRAPING_PENDING)
    .slice(0, 2);

  // for (const lead of newLeads) {
  //   await scrapingQueue.add('scrape-website', {
  //     leadId: lead.id,
  //     website: lead.website,
  //     traceId: lead.externalId,
  //   });
  // }

  return res.json({
    success: true,
    data: newLeads,
  });
});

router.post('/scrape-leads', async (_: Request, res: Response) => {
  const newLeads = await LeadsRepository.find(
    {
      status: LeadStatus.SCRAPING_PENDING,
    },
    { limit: 2 },
  );

  const results = await Promise.all(
    newLeads.map(async (lead) => {
      if (!lead.website) return null;

      try {
        const result = await ScrapingService.scrapeWebsite(
          lead.id,
          lead.website,
        );

        return [lead.businessName, result] as const;
      } catch (err) {
        console.error(`Scraping failed for ${lead.businessName}`, err);
        return null;
      }
    }),
  );

  const scrapingResult = new Map(
    results.filter(Boolean) as unknown as [string, ScrapeRawResult][],
  );

  return res.json({
    success: true,
    data: newLeads,
    results: Object.fromEntries(scrapingResult),
  });
});

router.post('/email/send', async (_: Request, res: Response) => {
  // Business flow outbound
  // const result = await OutreachService.SendOutReach(analysisId);

  // Direct email outbound
  const result = await EmailService.send({
    to: 'zainsaeed067@gmail.com',
    subject: `Testing - Digital analysis for your business`,
    html: `Hi! \n It's a digital analysis report for your business.`,
  });

  return res.json({
    success: true,
    data: result,
  });
});

router.post('/whatsapp/send', async (req: Request, res: Response) => {});

// router.post('/test-full-pipeline', async (_, res) => {
//   const execution = await AcquisitionExecutionRepository.create({
//     source: 'TEST',
//     status: 'RUNNING',
//     startedAt: new Date(),
//   });

//   const context = ContextFactory.create({
//     acquisitionExecutionId: execution.id,
//     provider: 'mock',
//   });

//   await leadAcquisitionQueue.add('test-acquisition', {
//     context,
//     data: {
//       sourceId: 'manual',
//       provider: 'mock',
//       query: 'car rentals dubai',
//       location: 'Dubai',
//     },
//   } satisfies BaseQueueJob<LeadAcquisitionPayload>);

//   res.json({
//     success: true,
//     executionId: execution.id,
//   });
// });

// router.post('/mock-leads', async (_, res) => {
//   const providerResult = await ProviderManager.fetchLeads('mock', {
//     query: 'query mock leads',
//     location: 'Dubai',
//   });

//   const results: any[] = [];

//   for (const lead of providerResult?.normalizedResults) {
//     const result = {
//       leadId: lead.id,
//       businessName: lead.businessName,
//       website: lead.website,

//       scraping: {},
//       qualification: {},
//       aiAnalysis: {},

//       success: false,
//       error: {},
//     };

//     try {
//       // ---------- Scraping ----------
//       const scraping = await ScrapingService.scrapeWebsite(
//         String(lead._id),
//         lead.website,
//       );

//       result.scraping = scraping;

//       // ---------- Qualification ----------
//       const qualification = await QualificationService.qualifyLead({
//         scrapeResultId: scraping.scrapeResultId,
//         leadId: String(lead._id),
//         scrapeSkipped: false,
//       });

//       result.qualification = qualification;

//       if (!qualification.qualified) {
//         result.success = true;
//         results.push(result);
//         continue;
//       }

//       // ---------- AI Analysis ----------
//       const aiService = new AIService();
//       const aiAnalysis = await aiService.analyzeBusiness(
//         String(lead._id),
//         scraping.scrapeResultId,
//       );

//       result.aiAnalysis = aiAnalysis;

//       result.success = true;
//     } catch (error) {
//       result.error = error instanceof Error ? error.message : String(error);
//     }

//     results.push(result);
//   }

//   return res.json({
//     success: true,
//     total: results.length,
//     qualified: results.filter((x) => x.qualification?.qualified).length,
//     analyzed: results.filter((x) => x.aiAnalysis).length,
//     results,
//   });
// });

router.post('/leads-aianalysis', async (_, res) => {
  const scrapeResults = await ScrapeRepository.getAll();
  const recentScrape = scrapeResults[0];

  // const recentScrapes = scrapeResults.slice(0,2);
  // const leads = await Promise.all(
  //   recentScrapes.map( async (scrape) =>{
  //  return LeadRepository.findById(String(scrape.leadId))
  // }));

  // ---------- AI Analysis ----------
  try {
    const aiService = new AIService();
    const aiAnalysis = await aiService.analyzeBusiness(
      recentScrape.leadId.toString(),
      recentScrape.id,
    );

    return res.json({
      success: true,
      aiAnalysis,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.log('Error during AI-Analysis', err);
    return res.json({
      success: false,
    });
  }
});

router.post('/outreach', async (_, res) => {
  try {
    const outreachMessage = await OutreachService.sendOutreach(
      '6a26159232aa4331407ca75b',
      // '6a26159232aa4331407ca753',
      // '6a26159132aa4331407ca749',
    );

    return res.json({
      success: true,
      outreachMessage,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return res.json({
      success: false,
      errorMessage,
    });
  }
});

export default router;
