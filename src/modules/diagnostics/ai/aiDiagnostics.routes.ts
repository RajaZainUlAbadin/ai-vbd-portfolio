import { Router } from 'express';
import { AIDiagnosticsController } from './aiDiagnostics.controller';

const router = Router();

router.post('/followup', AIDiagnosticsController.followup);

export default router;
