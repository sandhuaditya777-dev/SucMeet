import { Request, Response, NextFunction } from 'express';
import { RoomAccess } from '../models/RoomAccess.model';
import { Room } from '../models/Room.model';
import { ForbiddenError, NotFoundError } from '../lib/errors';
import { Role } from '@sucmeet/shared';

const ROLE_HIERARCHY: Record<Role, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

// ─── Get user's role in a room ─────────────────────────────────────────────────
export async function getRoomRole(
  roomId: string,
  userId: string
): Promise<Role | null> {
  const access = await RoomAccess.findOne({ roomId, userId });
  return access ? (access.role as Role) : null;
}

// ─── Check if user meets minimum role ─────────────────────────────────────────
export function hasMinRole(userRole: Role | null, minRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

// ─── Middleware Factory: requireRoomRole ───────────────────────────────────────
export function requireRoomRole(minRole: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomIdOrSlug = req.params.roomId || req.params.id;
      const userId = req.user!.id;

      // Find room by ID or slug
      const room = await Room.findOne({
        $or: [{ _id: roomIdOrSlug.match(/^[0-9a-f]{24}$/) ? roomIdOrSlug : null }, { slug: roomIdOrSlug }],
      });

      if (!room) {
        next(new NotFoundError('Room'));
        return;
      }

      // Attach room to request for downstream use
      req.room = room;

      const userRole = await getRoomRole(room.id, userId);

      if (!hasMinRole(userRole, minRole)) {
        next(new ForbiddenError(`You must be ${minRole} or higher to perform this action`));
        return;
      }

      req.roomRole = userRole!;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// ─── Shorthand middlewares ─────────────────────────────────────────────────────
export const requireMember = requireRoomRole('member');
export const requireAdmin = requireRoomRole('admin');
export const requireOwner = requireRoomRole('owner');
