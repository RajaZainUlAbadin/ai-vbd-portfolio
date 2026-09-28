import { Router } from 'express';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.get('/overview', DashboardController.overview);
router.get('/activity', DashboardController.activity);

router.get('/system/health', DashboardController.systemHealth);
router.get('/queues/health', DashboardController.queuesHealth);

router.get('/providerPerformance', DashboardController.providerPerformance);

export default router;
