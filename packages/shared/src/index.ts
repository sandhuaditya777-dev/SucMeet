// ─── Role Types ───────────────────────────────────────────────────────────────

export const Role = {
  MEMBER: 'member',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

// ─── Access Level Types ────────────────────────────────────────────────────────

export const RoomAccessLevel = {
  PUBLIC: 'public',
  TRUSTED: 'trusted',
  RESTRICTED: 'restricted',
} as const;

export type RoomAccessLevel = (typeof RoomAccessLevel)[keyof typeof RoomAccessLevel];

// ─── User Types ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  auth0Id: string;
  email: string;
  displayName: string;
  avatar?: string;
  language: string;
  timezone: string;
  isBot: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  displayName: string;
  avatar?: string;
}

// ─── Room Types ────────────────────────────────────────────────────────────────

export interface RoomConfig {
  everyoneCanMute: boolean;
  lobbyEnabled: boolean;
  maxParticipants?: number;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  accessLevel: RoomAccessLevel;
  config: RoomConfig;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomWithToken extends Room {
  livekit: {
    url: string;
    room: string;
    token: string;
  };
}

// ─── Room Access / Member Types ────────────────────────────────────────────────

export interface RoomMember {
  id: string;
  roomId: string;
  user: UserPublic;
  role: Role;
  joinedAt: string;
}

// ─── Lobby Types ───────────────────────────────────────────────────────────────

export const LobbyStatus = {
  WAITING: 'waiting',
  ACCEPTED: 'accepted',
  DENIED: 'denied',
  UNKNOWN: 'unknown',
} as const;

export type LobbyStatus = (typeof LobbyStatus)[keyof typeof LobbyStatus];

export interface LobbyParticipant {
  id: string;
  username: string;
  color: string;
  status: LobbyStatus;
  joinedAt: number;
}

// ─── Invitation Types ──────────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  roomId: string;
  email: string;
  role: Role;
  invitedBy: UserPublic;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Data Channel Message Types ────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  type: 'chat';
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}

export interface ReactionMessage {
  id: string;
  type: 'reaction';
  emoji: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}

export interface LobbyDecisionMessage {
  type: 'lobby_decision';
  status: 'accepted' | 'denied';
}

export type DataChannelMessage = ChatMessage | ReactionMessage | LobbyDecisionMessage;
