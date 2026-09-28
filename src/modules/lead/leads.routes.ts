import { Router } from 'express';
import { LeadsController } from './leads.controller';

const router = Router();

// router.post(
//   '/migrations/leads/contacts',
//   LeadsController.migrateLeadContacts,
// );

// GET /api/leads?
//   page=1
//   &limit=25
//   &status=QUALIFIED
//   &provider=google_places
//   &search=dental
//   &minScore=70
//   &location=Dubai
//   &sort=-createdAt
router.get('/', LeadsController.getLeads);
router.get('/:id', LeadsController.getLeadById);
router.get('/:id/timeline', LeadsController.getLeadWithTimeline);
router.get('/:id/analysis', LeadsController.aiAnalysis);
router.get('/:id/scrape-result', LeadsController.scrapeResult);
router.get('/:id/outreach-sequence', LeadsController.outreachSequence);

// POST /api/leads/:id/retry-qualification
// POST /api/leads/:id/retry-scraping
// POST /api/leads/:id/retry-analysis

// Create new Lead from the Website.
router.post('/website', LeadsController.newLeadFromWebsite);

// Update
router.patch('/:id/analysis/:analysisId/outreach-message', LeadsController.updateAnalysisMessage);
router.patch('/:id/contact/:contactId', LeadsController.updateLeadConact);

export default router;
