import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin, requireOwner } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import * as RoomsController from '../controllers/rooms.controller';
import * as LobbyController from '../controllers/lobby.controller';
import * as ParticipantsController from '../controllers/participants.controller';
import { createRoomSchema, updateRoomSchema } from '../schemas/room.schema';

const router = Router();

// Rate limiter for room creation
const createRoomLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many rooms created, please try again later' },
});

// ─── Room CRUD ────────────────────────────────────────────────────────────────
router.get('/', ...requireAuth, RoomsController.listRooms);
router.post('/', ...requireAuth, createRoomLimiter, validate(createRoomSchema), RoomsController.createRoom);
router.get('/:id', RoomsController.getRoom);
router.patch('/:id', ...requireAuth, requireAdmin, validate(updateRoomSchema), RoomsController.updateRoom);
router.delete('/:id', ...requireAuth, requireOwner, RoomsController.deleteRoom);

// ─── Room Members ─────────────────────────────────────────────────────────────
router.get('/:roomId/members', ...requireAuth, requireAdmin, RoomsController.listMembers);
router.post('/:roomId/members', ...requireAuth, requireAdmin, RoomsController.addMember);
router.patch('/:roomId/members/:userId', ...requireAuth, requireAdmin, RoomsController.updateMemberRole);
router.delete('/:roomId/members/:userId', ...requireAuth, requireAdmin, RoomsController.removeMember);

// ─── Lobby ────────────────────────────────────────────────────────────────────
router.post('/:roomId/lobby', LobbyController.knockLobby);
router.get('/:roomId/lobby', ...requireAuth, requireAdmin, LobbyController.listLobby);
router.post('/:roomId/lobby/:participantId/accept', ...requireAuth, requireAdmin, LobbyController.acceptParticipant);
router.post('/:roomId/lobby/:participantId/deny', ...requireAuth, requireAdmin, LobbyController.denyParticipant);

// ─── Participant Actions (Admin) ──────────────────────────────────────────────
router.post('/:id/participants/:identity/mute', ...requireAuth, requireAdmin, ParticipantsController.muteParticipant);
router.delete('/:id/participants/:identity', ...requireAuth, requireAdmin, ParticipantsController.kickParticipant);

export default router;
