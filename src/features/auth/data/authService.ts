/**
 * Auth Service - Firebase Integration
 * Questo file gestisce tutte le chiamate a Firebase Auth
 * Usa @react-native-firebase/auth per integrazione nativa
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { User } from '../domain/types';

/**
 * Converte un FirebaseUser in User della nostra app
 */
function mapFirebaseUser(firebaseUser: FirebaseAuthTypes.User): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
  };
}

/**
 * Auth Service
 */
export const authService = {
  /**
   * Login con email e password
   */
  async login(email: string, password: string): Promise<User> {
    const credential = await auth().signInWithEmailAndPassword(email, password);
    if (!credential.user) {
      throw { code: 'auth/user-not-found', message: 'Utente non trovato' };
    }
    return mapFirebaseUser(credential.user);
  },

  /**
   * Registrazione con email e password
   */
  async register(email: string, password: string, displayName: string): Promise<User> {
    const credential = await auth().createUserWithEmailAndPassword(email, password);
    if (!credential.user) {
      throw { code: 'auth/registration-failed', message: 'Registrazione fallita' };
    }
    await credential.user.updateProfile({ displayName });
    // Ricarica l'utente per avere il displayName aggiornato
    await credential.user.reload();
    return mapFirebaseUser(auth().currentUser || credential.user);
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await auth().signOut();
  },

  /**
   * Listener per i cambiamenti di stato auth
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        callback(mapFirebaseUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  },

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const firebaseUser = auth().currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
  },

  /**
   * Invia email per reset password
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    await auth().sendPasswordResetEmail(email);
  },
};
