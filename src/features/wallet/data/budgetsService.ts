/**
 * Budgets Firestore Service
 * Persiste i budget nella subcollection spaces/{spaceId}/budgets
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Budget,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '../domain/types';

/**
 * Get the budgets collection for a specific space
 */
function getBudgetsCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('budgets');
}

/**
 * Get all budgets for a space
 */
export async function getBudgets(spaceId: string): Promise<Budget[]> {
  const snapshot = await getBudgetsCollection(spaceId)
    .orderBy('month', 'desc')
    .get();

  const budgets: Budget[] = [];
  snapshot.forEach(doc => {
    budgets.push({
      id: doc.id,
      ...doc.data(),
    } as Budget);
  });

  return budgets;
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(spaceId: string, budgetId: string): Promise<Budget | null> {
  const doc = await getBudgetsCollection(spaceId).doc(budgetId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Budget;
}

/**
 * Get budget for a specific month
 */
export async function getBudgetForMonth(spaceId: string, month: string): Promise<Budget | null> {
  const snapshot = await getBudgetsCollection(spaceId)
    .where('month', '==', month)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Budget;
}

/**
 * Create a new budget
 */
export async function createBudget(spaceId: string, payload: CreateBudgetPayload): Promise<Budget> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  // Check if budget for this month already exists
  const existing = await getBudgetForMonth(spaceId, payload.month);
  if (existing) {
    throw new Error('Esiste già un budget per questo mese');
  }

  const now = new Date().toISOString();

  const budgetData = {
    spaceId,
    month: payload.month,
    globalLimit: payload.globalLimit,
    categoryLimits: payload.categoryLimits || {},
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await getBudgetsCollection(spaceId).add(budgetData);

  return {
    id: docRef.id,
    ...budgetData,
  };
}

/**
 * Create or update budget for a month
 */
export async function upsertBudget(spaceId: string, payload: CreateBudgetPayload): Promise<Budget> {
  const existing = await getBudgetForMonth(spaceId, payload.month);

  if (existing) {
    const updated = await updateBudget(spaceId, {
      id: existing.id,
      globalLimit: payload.globalLimit,
      categoryLimits: payload.categoryLimits,
    });
    return updated!;
  }

  return createBudget(spaceId, payload);
}

/**
 * Update a budget
 */
export async function updateBudget(spaceId: string, payload: UpdateBudgetPayload): Promise<Budget | null> {
  const budgetRef = getBudgetsCollection(spaceId).doc(payload.id);
  const doc = await budgetRef.get();

  if (!doc.exists) return null;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.globalLimit !== undefined) updates.globalLimit = payload.globalLimit;
  if (payload.categoryLimits !== undefined) updates.categoryLimits = payload.categoryLimits;

  await budgetRef.update(updates);

  const updatedDoc = await budgetRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Budget;
}

/**
 * Update category limit in a budget
 */
export async function updateCategoryLimit(
  spaceId: string,
  budgetId: string,
  categoryId: string,
  limit: number
): Promise<Budget | null> {
  const budgetRef = getBudgetsCollection(spaceId).doc(budgetId);
  const doc = await budgetRef.get();

  if (!doc.exists) return null;

  const budget = doc.data() as Budget;
  const categoryLimits = { ...budget.categoryLimits, [categoryId]: limit };

  await budgetRef.update({
    categoryLimits,
    updatedAt: new Date().toISOString(),
  });

  const updatedDoc = await budgetRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Budget;
}

/**
 * Remove category limit from a budget
 */
export async function removeCategoryLimit(
  spaceId: string,
  budgetId: string,
  categoryId: string
): Promise<Budget | null> {
  const budgetRef = getBudgetsCollection(spaceId).doc(budgetId);
  const doc = await budgetRef.get();

  if (!doc.exists) return null;

  const budget = doc.data() as Budget;
  const categoryLimits = { ...budget.categoryLimits };
  delete categoryLimits[categoryId];

  await budgetRef.update({
    categoryLimits,
    updatedAt: new Date().toISOString(),
  });

  const updatedDoc = await budgetRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Budget;
}

/**
 * Delete a budget
 */
export async function deleteBudget(spaceId: string, budgetId: string): Promise<boolean> {
  const budgetRef = getBudgetsCollection(spaceId).doc(budgetId);
  const doc = await budgetRef.get();

  if (!doc.exists) return false;

  await budgetRef.delete();
  return true;
}

/**
 * Copy budget from previous month
 */
export async function copyBudgetFromPreviousMonth(spaceId: string, targetMonth: string): Promise<Budget | null> {
  // Parse target month and get previous month
  const [year, month] = targetMonth.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1); // month - 2 because Date months are 0-indexed
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const prevBudget = await getBudgetForMonth(spaceId, prevMonth);
  if (!prevBudget) return null;

  return createBudget(spaceId, {
    month: targetMonth,
    globalLimit: prevBudget.globalLimit,
    categoryLimits: prevBudget.categoryLimits,
  });
}

/**
 * Real-time listener for budgets in a space
 */
export function onBudgetsChanged(
  spaceId: string,
  callback: (budgets: Budget[]) => void
): () => void {
  return getBudgetsCollection(spaceId)
    .orderBy('month', 'desc')
    .onSnapshot(snapshot => {
      const budgets: Budget[] = [];
      snapshot.forEach(doc => {
        budgets.push({
          id: doc.id,
          ...doc.data(),
        } as Budget);
      });
      callback(budgets);
    }, error => {
      console.error('Error listening to budgets:', error);
      callback([]);
    });
}

/**
 * Batch delete all budgets in a space (used when deleting a space)
 */
export async function deleteAllBudgetsInSpace(spaceId: string): Promise<void> {
  const snapshot = await getBudgetsCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
