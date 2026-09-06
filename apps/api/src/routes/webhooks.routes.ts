import { Router } from 'express';
import * as WebhooksController from '../controllers/webhooks.controller';

const router = Router();

// LiveKit server webhooks (validated via HMAC)
router.post('/livekit', WebhooksController.handleLiveKitWebhook);

export default router;
