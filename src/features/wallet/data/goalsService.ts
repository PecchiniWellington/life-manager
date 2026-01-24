/**
 * Savings Goals Firestore Service
 * Persiste gli obiettivi nella subcollection spaces/{spaceId}/goals
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  SavingsGoal,
  CreateGoalPayload,
  UpdateGoalPayload,
  GoalStatus,
} from '../domain/types';

/**
 * Get the goals collection for a specific space
 */
function getGoalsCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('goals');
}

/**
 * Get all goals for a space
 */
export async function getGoals(spaceId: string): Promise<SavingsGoal[]> {
  const snapshot = await getGoalsCollection(spaceId)
    .orderBy('createdAt', 'desc')
    .get();

  const goals: SavingsGoal[] = [];
  snapshot.forEach(doc => {
    goals.push({
      id: doc.id,
      ...doc.data(),
    } as SavingsGoal);
  });

  return goals;
}

/**
 * Get active goals only
 */
export async function getActiveGoals(spaceId: string): Promise<SavingsGoal[]> {
  const allGoals = await getGoals(spaceId);
  return allGoals.filter(g => g.status === 'active');
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(spaceId: string, goalId: string): Promise<SavingsGoal | null> {
  const doc = await getGoalsCollection(spaceId).doc(goalId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as SavingsGoal;
}

/**
 * Create a new goal
 */
export async function createGoal(spaceId: string, payload: CreateGoalPayload): Promise<SavingsGoal> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();

  const goalData = {
    spaceId,
    name: payload.name,
    targetAmount: payload.targetAmount,
    currentAmount: payload.currentAmount || 0,
    deadline: payload.deadline || null,
    icon: payload.icon || 'target',
    color: payload.color || '#007AFF',
    status: 'active' as GoalStatus,
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await getGoalsCollection(spaceId).add(goalData);

  return {
    id: docRef.id,
    ...goalData,
  };
}

/**
 * Update a goal
 */
export async function updateGoal(spaceId: string, payload: UpdateGoalPayload): Promise<SavingsGoal | null> {
  const goalRef = getGoalsCollection(spaceId).doc(payload.id);
  const doc = await goalRef.get();

  if (!doc.exists) return null;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.targetAmount !== undefined) updates.targetAmount = payload.targetAmount;
  if (payload.currentAmount !== undefined) updates.currentAmount = payload.currentAmount;
  if (payload.deadline !== undefined) updates.deadline = payload.deadline;
  if (payload.icon !== undefined) updates.icon = payload.icon;
  if (payload.color !== undefined) updates.color = payload.color;
  if (payload.status !== undefined) updates.status = payload.status;

  await goalRef.update(updates);

  const updatedDoc = await goalRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as SavingsGoal;
}

/**
 * Add amount to a goal
 */
export async function addToGoal(spaceId: string, goalId: string, amount: number): Promise<SavingsGoal | null> {
  const goalRef = getGoalsCollection(spaceId).doc(goalId);
  const doc = await goalRef.get();

  if (!doc.exists) return null;

  const goal = doc.data() as SavingsGoal;
  const newAmount = goal.currentAmount + amount;

  const updates: Record<string, unknown> = {
    currentAmount: newAmount,
    updatedAt: new Date().toISOString(),
  };

  // Auto-complete if target reached
  if (newAmount >= goal.targetAmount) {
    updates.status = 'completed';
  }

  await goalRef.update(updates);

  const updatedDoc = await goalRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as SavingsGoal;
}

/**
 * Withdraw amount from a goal
 */
export async function withdrawFromGoal(spaceId: string, goalId: string, amount: number): Promise<SavingsGoal | null> {
  const goalRef = getGoalsCollection(spaceId).doc(goalId);
  const doc = await goalRef.get();

  if (!doc.exists) return null;

  const goal = doc.data() as SavingsGoal;
  const newAmount = Math.max(0, goal.currentAmount - amount);

  const updates: Record<string, unknown> = {
    currentAmount: newAmount,
    updatedAt: new Date().toISOString(),
  };

  // Reactivate if was completed and now below target
  if (goal.status === 'completed' && newAmount < goal.targetAmount) {
    updates.status = 'active';
  }

  await goalRef.update(updates);

  const updatedDoc = await goalRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as SavingsGoal;
}

/**
 * Mark goal as completed
 */
export async function completeGoal(spaceId: string, goalId: string): Promise<SavingsGoal | null> {
  return updateGoal(spaceId, { id: goalId, status: 'completed' });
}

/**
 * Cancel a goal
 */
export async function cancelGoal(spaceId: string, goalId: string): Promise<SavingsGoal | null> {
  return updateGoal(spaceId, { id: goalId, status: 'cancelled' });
}

/**
 * Reactivate a goal
 */
export async function reactivateGoal(spaceId: string, goalId: string): Promise<SavingsGoal | null> {
  return updateGoal(spaceId, { id: goalId, status: 'active' });
}

/**
 * Delete a goal
 */
export async function deleteGoal(spaceId: string, goalId: string): Promise<boolean> {
  const goalRef = getGoalsCollection(spaceId).doc(goalId);
  const doc = await goalRef.get();

  if (!doc.exists) return false;

  await goalRef.delete();
  return true;
}

/**
 * Real-time listener for goals in a space
 */
export function onGoalsChanged(
  spaceId: string,
  callback: (goals: SavingsGoal[]) => void
): () => void {
  return getGoalsCollection(spaceId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const goals: SavingsGoal[] = [];
      snapshot.forEach(doc => {
        goals.push({
          id: doc.id,
          ...doc.data(),
        } as SavingsGoal);
      });
      callback(goals);
    }, error => {
      console.error('Error listening to goals:', error);
      callback([]);
    });
}

/**
 * Batch delete all goals in a space (used when deleting a space)
 */
export async function deleteAllGoalsInSpace(spaceId: string): Promise<void> {
  const snapshot = await getGoalsCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
