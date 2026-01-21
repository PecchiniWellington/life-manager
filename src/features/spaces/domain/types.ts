/**
 * Spaces Domain Types
 */

/**
 * Space - Uno spazio condivisibile
 */
export interface Space {
  id: string;
  name: string;
  ownerId: string;
  members: SpaceMember[];
  isPersonal: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Membro di uno spazio
 */
export interface SpaceMember {
  userId: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

/**
 * Invito a uno spazio
 */
export interface SpaceInvite {
  id: string;
  spaceId: string;
  spaceName: string;
  invitedEmail: string;
  invitedBy: {
    userId: string;
    displayName: string | null;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
}

/**
 * Payload per creare uno spazio
 */
export interface CreateSpacePayload {
  name: string;
  color?: string;
  icon?: string;
}

/**
 * Payload per invitare a uno spazio
 */
export interface InviteToSpacePayload {
  spaceId: string;
  email: string;
}

/**
 * Colori disponibili per gli spazi
 */
export const SPACE_COLORS = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#5856D6', // Indigo
  '#00C7BE', // Teal
] as const;

/**
 * Icone disponibili per gli spazi
 */
export const SPACE_ICONS = [
  'home',
  'people',
  'briefcase',
  'heart',
  'star',
  'folder',
  'grid',
  'sparkles',
] as const;

export type SpaceColor = typeof SPACE_COLORS[number];
export type SpaceIcon = typeof SPACE_ICONS[number];
