/**
 * Spaces Service - Firebase Firestore Integration
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Space,
  SpaceMember,
  SpaceInvite,
  CreateSpacePayload,
  InviteToSpacePayload,
  SPACE_COLORS,
} from '../domain/types';

const spacesCollection = firestore().collection('spaces');
const invitesCollection = firestore().collection('invites');
const usersCollection = firestore().collection('users');

/**
 * Crea lo spazio personale per un nuovo utente
 * Usa una transazione per evitare duplicati
 */
export async function createPersonalSpace(userId: string, userEmail: string, displayName: string | null): Promise<Space> {
  // Prima controlla se esiste già uno spazio personale per questo utente
  const existingSpaces = await spacesCollection
    .where('ownerId', '==', userId)
    .where('isPersonal', '==', true)
    .limit(1)
    .get();

  if (!existingSpaces.empty) {
    // Spazio personale già esistente, ritorna quello
    const existingDoc = existingSpaces.docs[0];
    return {
      id: existingDoc.id,
      ...existingDoc.data(),
    } as Space;
  }

  const now = new Date().toISOString();

  const member: SpaceMember = {
    userId,
    email: userEmail,
    displayName,
    photoURL: null,
    role: 'owner',
    joinedAt: now,
  };

  const spaceData = {
    name: 'Personale',
    ownerId: userId,
    members: [member],
    isPersonal: true,
    color: SPACE_COLORS[0],
    icon: 'person',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await spacesCollection.add(spaceData);

  // Aggiorna l'utente con lo spazio corrente
  await usersCollection.doc(userId).set({
    email: userEmail,
    displayName,
    currentSpaceId: docRef.id,
    createdAt: now,
  }, { merge: true });

  return {
    id: docRef.id,
    ...spaceData,
  };
}

/**
 * Crea un nuovo spazio
 */
export async function createSpace(payload: CreateSpacePayload): Promise<Space> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();

  const member: SpaceMember = {
    userId: currentUser.uid,
    email: currentUser.email || '',
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    role: 'owner',
    joinedAt: now,
  };

  const spaceData = {
    name: payload.name,
    ownerId: currentUser.uid,
    members: [member],
    isPersonal: false,
    color: payload.color || SPACE_COLORS[0],
    icon: payload.icon || 'folder',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await spacesCollection.add(spaceData);

  return {
    id: docRef.id,
    ...spaceData,
  };
}

/**
 * Ottieni tutti gli spazi dell'utente corrente
 */
export async function getUserSpaces(): Promise<Space[]> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  // Firebase non supporta query su array di oggetti complessi,
  // quindi facciamo la query in modo diverso
  const allSpacesSnapshot = await spacesCollection.get();

  const spaces: Space[] = [];
  allSpacesSnapshot.forEach(doc => {
    const data = doc.data();
    const isMember = data.members?.some((m: SpaceMember) => m.userId === currentUser.uid);
    if (isMember) {
      spaces.push({
        id: doc.id,
        ...data,
      } as Space);
    }
  });

  return spaces;
}

/**
 * Listener per gli spazi dell'utente
 */
export function onUserSpacesChanged(
  userId: string,
  callback: (spaces: Space[]) => void
): () => void {
  return spacesCollection.onSnapshot(snapshot => {
    const spacesMap = new Map<string, Space>();
    snapshot.forEach(doc => {
      const data = doc.data();
      const isMember = data.members?.some((m: SpaceMember) => m.userId === userId);
      if (isMember && !spacesMap.has(doc.id)) {
        spacesMap.set(doc.id, {
          id: doc.id,
          ...data,
        } as Space);
      }
    });
    callback(Array.from(spacesMap.values()));
  });
}

/**
 * Ottieni uno spazio specifico
 */
export async function getSpace(spaceId: string): Promise<Space | null> {
  const doc = await spacesCollection.doc(spaceId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Space;
}

/**
 * Aggiorna uno spazio
 */
export async function updateSpace(spaceId: string, updates: Partial<Space>): Promise<void> {
  await spacesCollection.doc(spaceId).update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Elimina uno spazio
 */
export async function deleteSpace(spaceId: string): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const space = await getSpace(spaceId);
  if (!space) throw new Error('Spazio non trovato');
  if (space.ownerId !== currentUser.uid) throw new Error('Solo il proprietario può eliminare lo spazio');
  if (space.isPersonal) throw new Error('Non puoi eliminare lo spazio personale');

  // Elimina tutti i documenti nelle subcollection
  const batch = firestore().batch();

  const eventsSnapshot = await spacesCollection.doc(spaceId).collection('events').get();
  eventsSnapshot.forEach(doc => batch.delete(doc.ref));

  const todosSnapshot = await spacesCollection.doc(spaceId).collection('todos').get();
  todosSnapshot.forEach(doc => batch.delete(doc.ref));

  const transactionsSnapshot = await spacesCollection.doc(spaceId).collection('transactions').get();
  transactionsSnapshot.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
  await spacesCollection.doc(spaceId).delete();
}

/**
 * Invita un utente a uno spazio
 */
export async function inviteToSpace(payload: InviteToSpacePayload): Promise<SpaceInvite> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const space = await getSpace(payload.spaceId);
  if (!space) throw new Error('Spazio non trovato');

  // Verifica che l'utente sia owner o admin
  const currentMember = space.members.find(m => m.userId === currentUser.uid);
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
    throw new Error('Non hai i permessi per invitare');
  }

  // Verifica che l'email non sia già membro
  const alreadyMember = space.members.some(m => m.email === payload.email);
  if (alreadyMember) throw new Error('Utente già membro dello spazio');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 giorni

  const inviteData = {
    spaceId: payload.spaceId,
    spaceName: space.name,
    invitedEmail: payload.email.toLowerCase(),
    invitedBy: {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email || '',
    },
    status: 'pending' as const,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const docRef = await invitesCollection.add(inviteData);

  return {
    id: docRef.id,
    ...inviteData,
  };
}

/**
 * Ottieni inviti pendenti per l'utente corrente
 */
export async function getPendingInvites(): Promise<SpaceInvite[]> {
  const currentUser = auth().currentUser;
  if (!currentUser || !currentUser.email) return [];

  const snapshot = await invitesCollection
    .where('invitedEmail', '==', currentUser.email.toLowerCase())
    .where('status', '==', 'pending')
    .get();

  const invites: SpaceInvite[] = [];
  snapshot.forEach(doc => {
    invites.push({
      id: doc.id,
      ...doc.data(),
    } as SpaceInvite);
  });

  return invites;
}

/**
 * Listener per inviti pendenti
 */
export function onPendingInvitesChanged(
  email: string,
  callback: (invites: SpaceInvite[]) => void
): () => void {
  return invitesCollection
    .where('invitedEmail', '==', email.toLowerCase())
    .where('status', '==', 'pending')
    .onSnapshot(snapshot => {
      const invites: SpaceInvite[] = [];
      snapshot.forEach(doc => {
        invites.push({
          id: doc.id,
          ...doc.data(),
        } as SpaceInvite);
      });
      callback(invites);
    });
}

/**
 * Accetta un invito
 */
export async function acceptInvite(inviteId: string): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const inviteDoc = await invitesCollection.doc(inviteId).get();
  if (!inviteDoc.exists) throw new Error('Invito non trovato');

  const invite = inviteDoc.data() as SpaceInvite;
  if (invite.status !== 'pending') throw new Error('Invito non più valido');

  const now = new Date().toISOString();

  // Aggiungi l'utente come membro dello spazio
  const newMember: SpaceMember = {
    userId: currentUser.uid,
    email: currentUser.email || '',
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    role: 'member',
    joinedAt: now,
  };

  await spacesCollection.doc(invite.spaceId).update({
    members: firestore.FieldValue.arrayUnion(newMember),
    updatedAt: now,
  });

  // Aggiorna lo stato dell'invito
  await invitesCollection.doc(inviteId).update({
    status: 'accepted',
  });
}

/**
 * Rifiuta un invito
 */
export async function rejectInvite(inviteId: string): Promise<void> {
  await invitesCollection.doc(inviteId).update({
    status: 'rejected',
  });
}

/**
 * Rimuovi un membro dallo spazio
 */
export async function removeMember(spaceId: string, memberUserId: string): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const space = await getSpace(spaceId);
  if (!space) throw new Error('Spazio non trovato');

  // Verifica permessi
  const currentMember = space.members.find(m => m.userId === currentUser.uid);
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
    throw new Error('Non hai i permessi per rimuovere membri');
  }

  // Non puoi rimuovere il proprietario
  if (memberUserId === space.ownerId) {
    throw new Error('Non puoi rimuovere il proprietario dello spazio');
  }

  const memberToRemove = space.members.find(m => m.userId === memberUserId);
  if (!memberToRemove) throw new Error('Membro non trovato');

  await spacesCollection.doc(spaceId).update({
    members: firestore.FieldValue.arrayRemove(memberToRemove),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Esci da uno spazio
 */
export async function leaveSpace(spaceId: string): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const space = await getSpace(spaceId);
  if (!space) throw new Error('Spazio non trovato');

  if (space.ownerId === currentUser.uid) {
    throw new Error('Il proprietario non può abbandonare lo spazio. Elimina lo spazio invece.');
  }

  const memberToRemove = space.members.find(m => m.userId === currentUser.uid);
  if (!memberToRemove) throw new Error('Non sei membro di questo spazio');

  await spacesCollection.doc(spaceId).update({
    members: firestore.FieldValue.arrayRemove(memberToRemove),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Imposta lo spazio corrente dell'utente
 */
export async function setCurrentSpace(spaceId: string): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  await usersCollection.doc(currentUser.uid).update({
    currentSpaceId: spaceId,
  });
}

/**
 * Ottieni lo spazio corrente dell'utente
 */
export async function getCurrentSpaceId(): Promise<string | null> {
  const currentUser = auth().currentUser;
  if (!currentUser) return null;

  const userDoc = await usersCollection.doc(currentUser.uid).get();
  if (!userDoc.exists) return null;

  return userDoc.data()?.currentSpaceId || null;
}

/**
 * Listener per lo spazio corrente
 */
export function onCurrentSpaceChanged(
  userId: string,
  callback: (spaceId: string | null) => void
): () => void {
  return usersCollection.doc(userId).onSnapshot(doc => {
    const data = doc.data();
    if (data) {
      callback(data.currentSpaceId || null);
    } else {
      callback(null);
    }
  });
}
