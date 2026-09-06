import { Request, Response, NextFunction } from 'express';
import { roomServiceClient } from '../lib/livekit';
import { BadRequestError } from '../lib/errors';

// POST /api/v1/rooms/:id/participants/:identity/mute
export async function muteParticipant(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: roomId, identity } = req.params;
    const { trackSid } = req.body;

    if (!trackSid) throw new BadRequestError('trackSid is required');

    await roomServiceClient.mutePublishedTrack(roomId, identity, trackSid, true);
    res.json({ message: 'Participant muted' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/rooms/:id/participants/:identity
export async function kickParticipant(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: roomId, identity } = req.params;
    await roomServiceClient.removeParticipant(roomId, identity);
    res.json({ message: 'Participant removed from room' });
  } catch (err) {
    next(err);
  }
}
