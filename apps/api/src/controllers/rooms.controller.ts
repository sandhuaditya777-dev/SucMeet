import { Request, Response, NextFunction } from 'express';
import * as RoomService from '../services/room.service';

// GET /api/v1/rooms
export async function listRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const rooms = await RoomService.getRoomsForUser(req.user!.id);
    res.json({ data: rooms });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/rooms
export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await RoomService.createRoom(req.body, req.user!.id);
    res.status(201).json({ data: room, message: 'Room created successfully' });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/rooms/:id
export async function getRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.query;
    const room = await RoomService.getRoomWithToken(
      req.params.id,
      req.user?.id,
      username as string | undefined
    );
    res.json({ data: room });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/rooms/:id
export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await RoomService.updateRoom(req.room!.id, req.body);
    res.json({ data: room, message: 'Room updated' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/rooms/:id
export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    await RoomService.deleteRoom(req.room!.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/rooms/:roomId/members
export async function listMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await RoomService.listMembers(req.params.roomId);
    res.json({ data: members });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/rooms/:roomId/members
export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.body;
    const access = await RoomService.addMember(req.params.roomId, userId, role || 'member');
    res.status(201).json({ data: access, message: 'Member added' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/rooms/:roomId/members/:userId
export async function updateMemberRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body;
    const access = await RoomService.updateMemberRole(
      req.params.roomId,
      req.params.userId,
      role
    );
    res.json({ data: access, message: 'Role updated' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/rooms/:roomId/members/:userId
export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    await RoomService.removeMember(req.params.roomId, req.params.userId, req.user!.id);
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}
