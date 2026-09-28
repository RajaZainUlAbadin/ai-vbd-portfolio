import { Router } from 'express';
import { OutreachController } from './outreach.controller';

const router = Router();

router.get('/', OutreachController.getOutreaches);
router.get('/stats', OutreachController.getStats);
router.get('/:id', OutreachController.getOutreachDetails);

router.patch('/:id', OutreachController.getOutreachDetails);

// router.post(/send-email, OutreachController.sendEmail);
// router.post(/verify-email, OutreachController.verifyEmail);

export default router;
