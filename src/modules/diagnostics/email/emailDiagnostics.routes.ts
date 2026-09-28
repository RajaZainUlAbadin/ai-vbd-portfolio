import { Router } from 'express';
import { EmailDiagnosticsController } from './emailDiagnostics.controller';

const router = Router();

router.post('/send', EmailDiagnosticsController.send);
router.post('/followup', EmailDiagnosticsController.followup);
router.post('/response', EmailDiagnosticsController.response);

router.post('/s3', EmailDiagnosticsController.s3);
router.post('/parser', EmailDiagnosticsController.parser);
router.post('/thread', EmailDiagnosticsController.thread);

router.post('/inbound', EmailDiagnosticsController.inbound);
router.post('/replay', EmailDiagnosticsController.replay);
router.post('/pipeline', EmailDiagnosticsController.pipeline);

export default router;
