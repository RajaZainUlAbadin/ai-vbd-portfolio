import { Router } from 'express';
import { ApplicationSettingsController } from '../controllers/applicationSettings.controller';

const router = Router();

router.get('/', ApplicationSettingsController.getSettings);

router.patch('/', ApplicationSettingsController.updateSettings);

router.patch(
  '/acquisition',
  ApplicationSettingsController.setAcquisitionEnabled,
);

router.patch(
  '/acquisition/providers/:provider',
  ApplicationSettingsController.setAcquisitionProviderEnabled,
);

router.patch(
  '/execution/providers/:provider',
  ApplicationSettingsController.setExecutionProviderEnabled,
);

router.patch('/outreach', ApplicationSettingsController.setOutreachEnabled);

router.patch('/followups', ApplicationSettingsController.setFollowupsEnabled);

export default router;
