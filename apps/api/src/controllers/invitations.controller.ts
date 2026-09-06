import { Request, Response, NextFunction } from 'express';
import { Invitation } from '../models/Invitation.model';
import { Room } from '../models/Room.model';
import { RoomAccess } from '../models/RoomAccess.model';
import { User } from '../models/User.model';
import { NotFoundError, BadRequestError } from '../lib/errors';
import { sendInvitationEmail } from '../services/email.service';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';

function generateToken() {
  return uuidv4().replace(/-/g, '');
}

// GET /api/v1/invitations/:token
export async function getInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('roomId', 'name slug')
      .populate('invitedBy', 'displayName avatar');

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new NotFoundError('Invitation');
    }
    if (invitation.acceptedAt) {
      throw new BadRequestError('This invitation has already been used');
    }

    res.json({ data: invitation });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/invitations/:token/accept
export async function acceptInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new NotFoundError('Invitation');
    }
    if (invitation.acceptedAt) {
      throw new BadRequestError('This invitation has already been used');
    }

    const userId = req.user!.id;

    // Add user to room
    await RoomAccess.findOneAndUpdate(
      { roomId: invitation.roomId, userId },
      { roomId: invitation.roomId, userId, role: invitation.role },
      { upsert: true, new: true }
    );

    // Mark invitation as accepted
    invitation.acceptedAt = new Date();
    await invitation.save();

    const room = await Room.findById(invitation.roomId);
    res.json({ data: { room }, message: 'Invitation accepted! You can now join the room.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/invitations/rooms/:roomId
export async function sendInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, role } = req.body;
    const { roomId } = req.params;

    if (!email) throw new BadRequestError('Email is required');

    const room = await Room.findById(roomId);
    if (!room) throw new NotFoundError('Room');

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      roomId,
      email,
      role: role || 'member',
      token,
      invitedBy: req.user!.id,
      expiresAt,
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/invite/${token}`;

    // Send email (non-blocking — don't fail if email errors)
    sendInvitationEmail({
      to: email,
      inviterName: req.user!.displayName,
      roomName: room.name,
      inviteUrl,
      expiresAt,
    }).catch((err) => logger.error('Invitation email failed:', err));

    res.status(201).json({
      data: { ...invitation.toJSON(), inviteUrl },
      message: `Invitation sent to ${email}`,
    });
  } catch (err) {
    next(err);
  }
}
