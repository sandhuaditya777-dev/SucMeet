import { getRedis } from '../lib/redis';
import { roomServiceClient } from '../lib/livekit';
import { NotFoundError, BadRequestError } from '../lib/errors';
import { DataPacket_Kind } from 'livekit-server-sdk';
import { LobbyParticipant, LobbyStatus } from '@sucmeet/shared';
import { v4 as uuidv4 } from 'uuid';

const LOBBY_TTL = 300; // 5 minutes in seconds

function lobbyKey(roomId: string, participantId: string) {
  return `lobby:${roomId}:participant:${participantId}`;
}

function lobbyIndexKey(roomId: string) {
  return `lobby:${roomId}:index`;
}

// ─── Add participant to lobby ──────────────────────────────────────────────────
export async function knockLobby(
  roomId: string,
  username: string,
  color: string,
  participantId?: string
): Promise<LobbyParticipant> {
  const redis = getRedis();
  const id = participantId || uuidv4();

  const participant: LobbyParticipant = {
    id,
    username,
    color,
    status: LobbyStatus.WAITING,
    joinedAt: Date.now(),
  };

  const key = lobbyKey(roomId, id);
  await redis.setex(key, LOBBY_TTL, JSON.stringify(participant));

  // Track all participants in an index set
  await redis.sadd(lobbyIndexKey(roomId), id);
  await redis.expire(lobbyIndexKey(roomId), LOBBY_TTL);

  return participant;
}

// ─── List all waiting participants ────────────────────────────────────────────
export async function listLobbyParticipants(roomId: string): Promise<LobbyParticipant[]> {
  const redis = getRedis();
  const ids = await redis.smembers(lobbyIndexKey(roomId));

  const participants: LobbyParticipant[] = [];
  for (const id of ids) {
    const data = await redis.get(lobbyKey(roomId, id));
    if (data) {
      const p: LobbyParticipant = JSON.parse(data);
      if (p.status === LobbyStatus.WAITING) {
        participants.push(p);
      }
    }
  }

  return participants.sort((a, b) => a.joinedAt - b.joinedAt);
}

// ─── Update participant status and notify via LiveKit ─────────────────────────
export async function updateLobbyStatus(
  roomId: string,
  participantId: string,
  status: 'accepted' | 'denied'
): Promise<void> {
  const redis = getRedis();
  const key = lobbyKey(roomId, participantId);
  const data = await redis.get(key);

  if (!data) throw new NotFoundError('Lobby participant');

  const participant: LobbyParticipant = JSON.parse(data);
  participant.status = status === 'accepted' ? LobbyStatus.ACCEPTED : LobbyStatus.DENIED;
  await redis.setex(key, LOBBY_TTL, JSON.stringify(participant));

  // Send decision via LiveKit data channel to the specific participant
  const message = JSON.stringify({ type: 'lobby_decision', status });
  const encoder = new TextEncoder();

  try {
    await roomServiceClient.sendData(
      roomId,
      encoder.encode(message),
      DataPacket_Kind.RELIABLE,
      { destinationIdentities: [participantId] }
    );
  } catch {
    // Don't fail if LiveKit room doesn't exist yet
  }
}

// ─── Remove participant from lobby ────────────────────────────────────────────
export async function removeFromLobby(roomId: string, participantId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(lobbyKey(roomId, participantId));
  await redis.srem(lobbyIndexKey(roomId), participantId);
}
