/**
 * Auth Domain Types
 */

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
}

/**
 * Auth state
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Login payload
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Register payload
 */
export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Auth validation errors
 */
export interface AuthValidationErrors {
  email?: string;
  password?: string;
  displayName?: string;
  general?: string;
}

/**
 * Firebase auth error codes mapping
 */
export const authErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Questa email è già registrata',
  'auth/invalid-email': 'Email non valida',
  'auth/operation-not-allowed': 'Operazione non consentita',
  'auth/weak-password': 'Password troppo debole (minimo 6 caratteri)',
  'auth/user-disabled': 'Account disabilitato',
  'auth/user-not-found': 'Utente non trovato',
  'auth/wrong-password': 'Password errata',
  'auth/invalid-credential': 'Credenziali non valide',
  'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
  'auth/network-request-failed': 'Errore di rete. Controlla la connessione',
  default: 'Si è verificato un errore. Riprova',
};

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  return authErrorMessages[errorCode] || authErrorMessages.default;
}

/**
 * Update profile payload
 */
export interface UpdateProfilePayload {
  displayName: string;
}

/**
 * Update email payload
 */
export interface UpdateEmailPayload {
  newEmail: string;
  currentPassword: string;
}

/**
 * Change password payload
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Profile validation errors
 */
export interface ProfileValidationErrors {
  displayName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}
