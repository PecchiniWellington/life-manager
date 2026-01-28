/**
 * Auth Service - Firebase Integration
 * Questo file gestisce tutte le chiamate a Firebase Auth
 * Usa @react-native-firebase/auth per integrazione nativa
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import * as FileSystem from 'expo-file-system';
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

  /**
   * Aggiorna il profilo utente (displayName)
   */
  async updateProfile(displayName: string): Promise<User> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw { code: 'auth/no-user', message: 'Nessun utente autenticato' };
    }
    await currentUser.updateProfile({ displayName });
    await currentUser.reload();
    return mapFirebaseUser(auth().currentUser!);
  },

  /**
   * Aggiorna l'email utente (richiede ri-autenticazione)
   */
  async updateEmail(newEmail: string, currentPassword: string): Promise<User> {
    const currentUser = auth().currentUser;
    if (!currentUser || !currentUser.email) {
      throw { code: 'auth/no-user', message: 'Nessun utente autenticato' };
    }

    // Ri-autentica l'utente prima di cambiare email
    const credential = auth.EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await currentUser.reauthenticateWithCredential(credential);

    // Aggiorna email
    await currentUser.verifyBeforeUpdateEmail(newEmail);
    await currentUser.reload();
    return mapFirebaseUser(auth().currentUser!);
  },

  /**
   * Cambia la password (richiede ri-autenticazione)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser || !currentUser.email) {
      throw { code: 'auth/no-user', message: 'Nessun utente autenticato' };
    }

    // Ri-autentica l'utente
    const credential = auth.EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await currentUser.reauthenticateWithCredential(credential);

    // Aggiorna password
    await currentUser.updatePassword(newPassword);
  },

  /**
   * Carica un'immagine avatar su Firebase Storage e aggiorna il profilo
   */
  async uploadAvatar(imageUri: string): Promise<User> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw { code: 'auth/no-user', message: 'Nessun utente autenticato' };
    }

    try {
      // Path su Storage: avatars/{userId}.jpg
      const storagePath = `avatars/${currentUser.uid}.jpg`;
      const reference = storage().ref(storagePath);

      console.log('=== UPLOAD DEBUG ===');
      console.log('Storage bucket:', storage().app.options.storageBucket);
      console.log('User ID:', currentUser.uid);
      console.log('Upload path:', storagePath);
      console.log('Source URI:', imageUri);

      // Leggi il file come base64
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Base64 data length:', base64Data.length);

      // Upload usando putString con base64
      const task = await reference.putString(base64Data, 'base64', {
        contentType: 'image/jpeg',
      });

      console.log('Upload completed, state:', task.state);

      // Ottieni URL pubblico
      const downloadURL = await reference.getDownloadURL();
      console.log('Download URL:', downloadURL);

      // Aggiorna profilo con nuovo photoURL
      await currentUser.updateProfile({ photoURL: downloadURL });
      await currentUser.reload();

      return mapFirebaseUser(auth().currentUser!);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string; nativeErrorMessage?: string };
      console.error('=== UPLOAD ERROR ===');
      console.error('Error code:', firebaseError.code);
      console.error('Error message:', firebaseError.message);
      console.error('Native error:', firebaseError.nativeErrorMessage);
      console.error('Full error:', JSON.stringify(error, null, 2));

      // Se è un errore di permessi, diamo un messaggio più chiaro
      if (firebaseError.code === 'storage/unauthorized') {
        throw { code: 'storage/unauthorized', message: 'Non hai i permessi per caricare immagini. Controlla le regole di Firebase Storage.' };
      }

      throw error;
    }
  },

  /**
   * Rimuove l'avatar dell'utente
   */
  async removeAvatar(): Promise<User> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw { code: 'auth/no-user', message: 'Nessun utente autenticato' };
    }

    // Rimuove il file da Storage (se esiste)
    try {
      const storagePath = `avatars/${currentUser.uid}.jpg`;
      await storage().ref(storagePath).delete();
    } catch {
      // Ignora errore se il file non esiste
    }

    // Rimuove photoURL dal profilo
    await currentUser.updateProfile({ photoURL: null });
    await currentUser.reload();

    return mapFirebaseUser(auth().currentUser!);
  },
};
