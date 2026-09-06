import slugifyLib from 'slugify';
import { Room } from '../models/Room.model';
import { RoomAccess } from '../models/RoomAccess.model';
import { generateLiveKitToken, LIVEKIT_URL } from '../lib/livekit';
import { NotFoundError, ConflictError, ForbiddenError } from '../lib/errors';
import { getRoomRole } from '../middleware/role.middleware';
import { CreateRoomInput, UpdateRoomInput } from '../schemas/room.schema';
import { Role } from '@sucmeet/shared';

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugifyLib(name, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (await Room.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

// ─── Service Functions ─────────────────────────────────────────────────────────

export async function createRoom(data: CreateRoomInput, userId: string) {
  const slug = await generateUniqueSlug(data.name);

  const room = await Room.create({
    name: data.name,
    slug,
    accessLevel: data.accessLevel,
    config: data.config || {},
    createdBy: userId,
  });

  // Auto-add creator as owner
  await RoomAccess.create({ roomId: room.id, userId, role: 'owner' });

  return room;
}

export async function getRoomsForUser(userId: string) {
  const accesses = await RoomAccess.find({ userId }).populate('roomId');
  return accesses
    .map((a) => a.roomId)
    .filter(Boolean);
}

export async function getRoomWithToken(
  idOrSlug: string,
  userId?: string,
  displayName?: string
): Promise<Record<string, unknown>> {
  // Try UUID first, then slug
  const isObjectId = /^[0-9a-f]{24}$/i.test(idOrSlug);
  const room = await Room.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug });

  if (!room) {
    // Check if unregistered rooms are allowed (ad-hoc mode)
    if (process.env.ALLOW_UNREGISTERED_ROOMS === 'true') {
      const slug = slugifyLib(idOrSlug, { lower: true, strict: true });
      const identity = userId || `guest-${Math.random().toString(36).slice(2, 8)}`;
      const name = displayName || 'Guest';
      return {
        id: null,
        livekit: {
          url: LIVEKIT_URL,
          room: slug,
          token: await generateLiveKitToken(identity, name, { room: slug }),
        },
      };
    }
    throw new NotFoundError('Room');
  }

  // Check access for restricted rooms
  if (room.accessLevel === 'restricted' && userId) {
    const role = await getRoomRole(room.id, userId);
    if (!role) throw new ForbiddenError('This room is restricted. You need an invitation to join.');
  }

  const identity = userId || `guest-${Math.random().toString(36).slice(2, 8)}`;
  const name = displayName || 'Guest';

  // Admins/owners get room admin privileges in LiveKit
  const userRole = userId ? await getRoomRole(room.id, userId) : null;
  const isAdminPlus = userRole === 'admin' || userRole === 'owner';

  const token = await generateLiveKitToken(identity, name, {
    room: room.id,
    roomAdmin: isAdminPlus,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return {
    ...room.toJSON(),
    livekit: {
      url: LIVEKIT_URL,
      room: room.id,
      token,
    },
  };
}

export async function updateRoom(roomId: string, data: UpdateRoomInput) {
  const room = await Room.findByIdAndUpdate(
    roomId,
    { $set: { ...data } },
    { new: true, runValidators: true }
  );
  if (!room) throw new NotFoundError('Room');
  return room;
}

export async function deleteRoom(roomId: string) {
  const room = await Room.findByIdAndDelete(roomId);
  if (!room) throw new NotFoundError('Room');
  // Clean up all accesses
  await RoomAccess.deleteMany({ roomId });
  return room;
}

export async function listMembers(roomId: string) {
  return RoomAccess.find({ roomId }).populate('userId', 'id displayName avatar email');
}

export async function addMember(roomId: string, userId: string, role: Role) {
  const existing = await RoomAccess.findOne({ roomId, userId });
  if (existing) throw new ConflictError('User is already a member of this room');
  return RoomAccess.create({ roomId, userId, role });
}

export async function updateMemberRole(roomId: string, userId: string, role: Role) {
  // Prevent removing the last owner
  if (role !== 'owner') {
    const ownerCount = await RoomAccess.countDocuments({ roomId, role: 'owner' });
    const isThisOwner = await RoomAccess.exists({ roomId, userId, role: 'owner' });
    if (ownerCount === 1 && isThisOwner) {
      throw new ForbiddenError('Cannot change the role of the last owner');
    }
  }

  const access = await RoomAccess.findOneAndUpdate(
    { roomId, userId },
    { role },
    { new: true }
  );
  if (!access) throw new NotFoundError('Room member');
  return access;
}

export async function removeMember(roomId: string, userId: string, requesterId: string) {
  // Prevent removing last owner
  const access = await RoomAccess.findOne({ roomId, userId });
  if (!access) throw new NotFoundError('Room member');

  if (access.role === 'owner') {
    const ownerCount = await RoomAccess.countDocuments({ roomId, role: 'owner' });
    if (ownerCount === 1) throw new ForbiddenError('Cannot remove the last owner of a room');
  }

  await RoomAccess.deleteOne({ roomId, userId });
}
