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
  // Blues
  '#007AFF', // System Blue
  '#5856D6', // Indigo
  '#0A84FF', // Blue Light
  '#5AC8FA', // Sky Blue
  '#32ADE6', // Cyan Blue
  '#1E90FF', // Dodger Blue
  '#4169E1', // Royal Blue
  '#6495ED', // Cornflower Blue

  // Greens
  '#34C759', // System Green
  '#30D158', // Green Light
  '#00C7BE', // Teal
  '#2E8B57', // Sea Green
  '#3CB371', // Medium Sea Green
  '#66CDAA', // Medium Aquamarine
  '#20B2AA', // Light Sea Green
  '#00CED1', // Dark Turquoise

  // Yellows & Oranges
  '#FF9500', // System Orange
  '#FF9F0A', // Orange Light
  '#FFCC00', // Yellow
  '#FFD60A', // Yellow Light
  '#F0A500', // Amber
  '#FF8C00', // Dark Orange
  '#FFA07A', // Light Salmon
  '#E67E22', // Carrot

  // Reds & Pinks
  '#FF3B30', // System Red
  '#FF453A', // Red Light
  '#FF2D55', // System Pink
  '#FF375F', // Pink Light
  '#FF6B6B', // Coral Red
  '#E74C3C', // Alizarin
  '#C0392B', // Pomegranate
  '#FF69B4', // Hot Pink

  // Purples & Violets
  '#AF52DE', // System Purple
  '#BF5AF2', // Purple Light
  '#9B59B6', // Amethyst
  '#8E44AD', // Wisteria
  '#7B68EE', // Medium Slate Blue
  '#9370DB', // Medium Purple
  '#BA55D3', // Medium Orchid
  '#DA70D6', // Orchid

  // Browns & Neutrals
  '#A2845E', // Brown
  '#D4A574', // Tan
  '#8B4513', // Saddle Brown
  '#CD853F', // Peru
  '#B8860B', // Dark Goldenrod
  '#708090', // Slate Gray
  '#778899', // Light Slate Gray
  '#6B7280', // Gray
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
