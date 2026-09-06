import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500, 'Name too long').trim(),
  accessLevel: z.enum(['public', 'trusted', 'restricted']).optional().default('public'),
  config: z
    .object({
      everyoneCanMute: z.boolean().optional(),
      lobbyEnabled: z.boolean().optional(),
      maxParticipants: z.number().int().min(2).max(500).optional(),
    })
    .optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(500).trim().optional(),
  accessLevel: z.enum(['public', 'trusted', 'restricted']).optional(),
  config: z
    .object({
      everyoneCanMute: z.boolean().optional(),
      lobbyEnabled: z.boolean().optional(),
      maxParticipants: z.number().int().min(2).max(500).optional(),
    })
    .optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
