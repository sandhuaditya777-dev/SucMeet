import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';
const API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

export const roomServiceClient = new RoomServiceClient(LIVEKIT_URL, API_KEY, API_SECRET);

export interface TokenGrants {
  roomJoin?: boolean;
  room: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  roomAdmin?: boolean;
  roomCreate?: boolean;
}

export async function generateLiveKitToken(
  identity: string,
  name: string,
  grants: TokenGrants
): Promise<string> {
  const token = new AccessToken(API_KEY, API_SECRET, {
    identity,
    name,
    ttl: '2h',
  });

  token.addGrant({
    roomJoin: grants.roomJoin ?? true,
    room: grants.room,
    canPublish: grants.canPublish ?? true,
    canSubscribe: grants.canSubscribe ?? true,
    canPublishData: grants.canPublishData ?? true,
    roomAdmin: grants.roomAdmin ?? false,
    roomCreate: grants.roomCreate ?? false,
  });

  return await token.toJwt();
}

export { LIVEKIT_URL };
