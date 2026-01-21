/**
 * Auth Service - Firebase Integration
 * Questo file gestisce tutte le chiamate a Firebase Auth
 */

import { User } from '../domain/types';

// Firebase imports - da configurare
// import { auth } from '@app/config/firebase';
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   updateProfile,
//   onAuthStateChanged,
//   User as FirebaseUser,
// } from 'firebase/auth';

/**
 * Converte un FirebaseUser in User della nostra app
 */
function mapFirebaseUser(firebaseUser: any): User {
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
    // TODO: Uncomment quando Firebase è configurato
    // const credential = await signInWithEmailAndPassword(auth, email, password);
    // return mapFirebaseUser(credential.user);

    // Mock per sviluppo
    console.log('Login attempt:', email);
    throw { code: 'auth/not-configured', message: 'Firebase non configurato' };
  },

  /**
   * Registrazione con email e password
   */
  async register(email: string, password: string, displayName: string): Promise<User> {
    // TODO: Uncomment quando Firebase è configurato
    // const credential = await createUserWithEmailAndPassword(auth, email, password);
    // await updateProfile(credential.user, { displayName });
    // return mapFirebaseUser(credential.user);

    // Mock per sviluppo
    console.log('Register attempt:', email, displayName);
    throw { code: 'auth/not-configured', message: 'Firebase non configurato' };
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // TODO: Uncomment quando Firebase è configurato
    // await signOut(auth);

    console.log('Logout attempt');
  },

  /**
   * Listener per i cambiamenti di stato auth
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // TODO: Uncomment quando Firebase è configurato
    // return onAuthStateChanged(auth, (firebaseUser) => {
    //   if (firebaseUser) {
    //     callback(mapFirebaseUser(firebaseUser));
    //   } else {
    //     callback(null);
    //   }
    // });

    // Mock per sviluppo - simula utente non loggato
    setTimeout(() => callback(null), 500);
    return () => {};
  },

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    // TODO: Uncomment quando Firebase è configurato
    // const firebaseUser = auth.currentUser;
    // return firebaseUser ? mapFirebaseUser(firebaseUser) : null;

    return null;
  },
};
