import { Request, Response, NextFunction } from 'express';
import * as LobbyService from '../services/lobby.service';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// POST /api/v1/rooms/:roomId/lobby
export async function knockLobby(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, participantId } = req.body;
    const participant = await LobbyService.knockLobby(
      req.params.roomId,
      username || 'Guest',
      randomColor(),
      participantId
    );
    res.status(201).json({ data: participant });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/rooms/:roomId/lobby
export async function listLobby(req: Request, res: Response, next: NextFunction) {
  try {
    const participants = await LobbyService.listLobbyParticipants(req.params.roomId);
    res.json({ data: participants });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/rooms/:roomId/lobby/:participantId/accept
export async function acceptParticipant(req: Request, res: Response, next: NextFunction) {
  try {
    await LobbyService.updateLobbyStatus(
      req.params.roomId,
      req.params.participantId,
      'accepted'
    );
    res.json({ message: 'Participant accepted' });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/rooms/:roomId/lobby/:participantId/deny
export async function denyParticipant(req: Request, res: Response, next: NextFunction) {
  try {
    await LobbyService.updateLobbyStatus(
      req.params.roomId,
      req.params.participantId,
      'denied'
    );
    res.json({ message: 'Participant denied' });
  } catch (err) {
    next(err);
  }
}
