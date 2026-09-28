import { Router } from 'express';
import { AcquisitionController } from './acquisition.controller';
import { leadImportUpload } from './middleware/leadImportUpload';

const router = Router();

router.post(
  '/leads/import',
  leadImportUpload.single('file'),
  AcquisitionController.importLeads,
);

export default router;
