import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import * as InvitationsController from '../controllers/invitations.controller';

const router = Router();

const sendInviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { error: 'Too many invitations sent, please try again later' },
});

// Validate and show invitation details (public - uses token)
router.get('/:token', InvitationsController.getInvitation);

// Accept invitation (auth required - need to know who's accepting)
router.post('/:token/accept', ...requireAuth, InvitationsController.acceptInvitation);

// Send invitation to a room (handled via rooms router)
// POST /api/v1/rooms/:roomId/invitations → see rooms.routes.ts
router.post('/rooms/:roomId', ...requireAuth, sendInviteLimiter, InvitationsController.sendInvitation);

export default router;
