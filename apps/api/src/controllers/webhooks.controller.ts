import { Request, Response, NextFunction } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import { logger } from '../lib/logger';

const API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

const receiver = new WebhookReceiver(API_KEY, API_SECRET);

// POST /api/v1/webhooks/livekit
export async function handleLiveKitWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'] as string;
    const body = JSON.stringify(req.body);

    // Validate HMAC signature
    const event = await receiver.receive(body, authHeader);

    logger.info(`LiveKit webhook: ${event.event}`);

    switch (event.event) {
      case 'room_started':
        logger.info(`Room started: ${event.room?.name}`);
        break;
      case 'room_finished':
        logger.info(`Room finished: ${event.room?.name}`);
        // TODO: clean up lobby cache for this room
        break;
      case 'participant_joined':
        logger.info(`Participant joined: ${event.participant?.identity} → ${event.room?.name}`);
        break;
      case 'participant_left':
        logger.info(`Participant left: ${event.participant?.identity} → ${event.room?.name}`);
        break;
      default:
        logger.debug(`Unhandled LiveKit event: ${event.event}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error('LiveKit webhook validation failed:', err);
    res.status(401).json({ error: 'Invalid webhook signature' });
  }
}
