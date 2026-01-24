/**
 * Accounts Firestore Service
 * Persiste i conti nella subcollection spaces/{spaceId}/accounts
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
  accountTypeIcons,
} from '../domain/types';
import { appleColors } from '@shared/ui/tokens';

/**
 * Get the accounts collection for a specific space
 */
function getAccountsCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('accounts');
}

/**
 * Get all accounts for a space
 */
export async function getAccounts(spaceId: string): Promise<Account[]> {
  const snapshot = await getAccountsCollection(spaceId)
    .orderBy('createdAt', 'asc')
    .get();

  const accounts: Account[] = [];
  snapshot.forEach(doc => {
    const data = doc.data() as Omit<Account, 'id'>;
    // Filter out archived accounts client-side
    if (!data.isArchived) {
      accounts.push({
        id: doc.id,
        ...data,
      });
    }
  });

  // Sort client-side: default accounts first
  return accounts.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });
}

/**
 * Get a single account by ID
 */
export async function getAccountById(spaceId: string, accountId: string): Promise<Account | null> {
  const doc = await getAccountsCollection(spaceId).doc(accountId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Account;
}

/**
 * Get default account for a space
 */
export async function getDefaultAccount(spaceId: string): Promise<Account | null> {
  const snapshot = await getAccountsCollection(spaceId)
    .where('isDefault', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Account;
}

/**
 * Create a new account
 */
export async function createAccount(spaceId: string, payload: CreateAccountPayload): Promise<Account> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();

  // If this is set as default, unset other defaults first
  if (payload.isDefault) {
    await unsetAllDefaults(spaceId);
  }

  const accountData = {
    spaceId,
    name: payload.name,
    type: payload.type,
    icon: payload.icon || accountTypeIcons[payload.type],
    color: payload.color || appleColors.systemBlue,
    initialBalance: payload.initialBalance || 0,
    isDefault: payload.isDefault || false,
    isArchived: false,
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await getAccountsCollection(spaceId).add(accountData);

  return {
    id: docRef.id,
    ...accountData,
  };
}

/**
 * Create default account for a space (called when space is created)
 */
export async function createDefaultAccount(spaceId: string): Promise<Account> {
  return createAccount(spaceId, {
    name: 'Principale',
    type: 'bank',
    icon: 'wallet',
    color: appleColors.systemBlue,
    initialBalance: 0,
    isDefault: true,
  });
}

/**
 * Update an account
 */
export async function updateAccount(spaceId: string, payload: UpdateAccountPayload): Promise<Account | null> {
  const accountRef = getAccountsCollection(spaceId).doc(payload.id);
  const doc = await accountRef.get();

  if (!doc.exists) return null;

  // If setting as default, unset other defaults first
  if (payload.isDefault === true) {
    await unsetAllDefaults(spaceId);
  }

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.icon !== undefined) updates.icon = payload.icon;
  if (payload.color !== undefined) updates.color = payload.color;
  if (payload.initialBalance !== undefined) updates.initialBalance = payload.initialBalance;
  if (payload.isDefault !== undefined) updates.isDefault = payload.isDefault;
  if (payload.isArchived !== undefined) updates.isArchived = payload.isArchived;

  await accountRef.update(updates);

  const updatedDoc = await accountRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Account;
}

/**
 * Delete an account (actually archives it)
 */
export async function deleteAccount(spaceId: string, accountId: string): Promise<boolean> {
  const accountRef = getAccountsCollection(spaceId).doc(accountId);
  const doc = await accountRef.get();

  if (!doc.exists) return false;

  const account = doc.data() as Account;

  // Cannot delete default account
  if (account.isDefault) {
    throw new Error('Non puoi eliminare il conto principale');
  }

  // Archive instead of delete
  await accountRef.update({
    isArchived: true,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

/**
 * Permanently delete an account
 */
export async function permanentlyDeleteAccount(spaceId: string, accountId: string): Promise<boolean> {
  const accountRef = getAccountsCollection(spaceId).doc(accountId);
  const doc = await accountRef.get();

  if (!doc.exists) return false;

  await accountRef.delete();
  return true;
}

/**
 * Unset all default accounts (helper for setting new default)
 */
async function unsetAllDefaults(spaceId: string): Promise<void> {
  const snapshot = await getAccountsCollection(spaceId)
    .where('isDefault', '==', true)
    .get();

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.update(doc.ref, { isDefault: false });
  });

  await batch.commit();
}

/**
 * Real-time listener for accounts in a space
 */
export function onAccountsChanged(
  spaceId: string,
  callback: (accounts: Account[]) => void
): () => void {
  return getAccountsCollection(spaceId)
    .orderBy('createdAt', 'asc')
    .onSnapshot(snapshot => {
      const accounts: Account[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as Omit<Account, 'id'>;
        // Filter out archived accounts client-side
        if (!data.isArchived) {
          accounts.push({
            id: doc.id,
            ...data,
          });
        }
      });
      // Sort client-side: default accounts first
      const sorted = accounts.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      callback(sorted);
    }, error => {
      console.error('Error listening to accounts:', error);
      callback([]);
    });
}

/**
 * Batch delete all accounts in a space (used when deleting a space)
 */
export async function deleteAllAccountsInSpace(spaceId: string): Promise<void> {
  const snapshot = await getAccountsCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
