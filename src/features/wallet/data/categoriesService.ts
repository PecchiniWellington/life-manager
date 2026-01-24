/**
 * Categories Firestore Service
 * Persiste le categorie personalizzate nella subcollection spaces/{spaceId}/categories
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../domain/types';

/**
 * Get the categories collection for a specific space
 */
function getCategoriesCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('categories');
}

/**
 * Get all categories for a space
 */
export async function getCategories(spaceId: string): Promise<Category[]> {
  const snapshot = await getCategoriesCollection(spaceId)
    .orderBy('sortOrder', 'asc')
    .get();

  const categories: Category[] = [];
  snapshot.forEach(doc => {
    categories.push({
      id: doc.id,
      ...doc.data(),
    } as Category);
  });

  return categories;
}

/**
 * Get expense categories only
 */
export async function getExpenseCategories(spaceId: string): Promise<Category[]> {
  const snapshot = await getCategoriesCollection(spaceId)
    .where('type', '==', 'expense')
    .orderBy('sortOrder', 'asc')
    .get();

  const categories: Category[] = [];
  snapshot.forEach(doc => {
    categories.push({
      id: doc.id,
      ...doc.data(),
    } as Category);
  });

  return categories;
}

/**
 * Get income categories only
 */
export async function getIncomeCategories(spaceId: string): Promise<Category[]> {
  const snapshot = await getCategoriesCollection(spaceId)
    .where('type', '==', 'income')
    .orderBy('sortOrder', 'asc')
    .get();

  const categories: Category[] = [];
  snapshot.forEach(doc => {
    categories.push({
      id: doc.id,
      ...doc.data(),
    } as Category);
  });

  return categories;
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(spaceId: string, categoryId: string): Promise<Category | null> {
  const doc = await getCategoriesCollection(spaceId).doc(categoryId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Category;
}

/**
 * Create a new category
 */
export async function createCategory(spaceId: string, payload: CreateCategoryPayload): Promise<Category> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();

  // Get max sortOrder for this type
  const existingCategories = await getCategories(spaceId);
  const maxSortOrder = existingCategories
    .filter(c => c.type === payload.type)
    .reduce((max, c) => Math.max(max, c.sortOrder), -1);

  const categoryData = {
    spaceId,
    name: payload.name,
    icon: payload.icon,
    color: payload.color,
    type: payload.type,
    isDefault: false,
    sortOrder: payload.sortOrder ?? maxSortOrder + 1,
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await getCategoriesCollection(spaceId).add(categoryData);

  return {
    id: docRef.id,
    ...categoryData,
  };
}

/**
 * Update a category
 */
export async function updateCategory(spaceId: string, payload: UpdateCategoryPayload): Promise<Category | null> {
  const categoryRef = getCategoriesCollection(spaceId).doc(payload.id);
  const doc = await categoryRef.get();

  if (!doc.exists) return null;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.icon !== undefined) updates.icon = payload.icon;
  if (payload.color !== undefined) updates.color = payload.color;
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.sortOrder !== undefined) updates.sortOrder = payload.sortOrder;

  await categoryRef.update(updates);

  const updatedDoc = await categoryRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Category;
}

/**
 * Delete a category
 */
export async function deleteCategory(spaceId: string, categoryId: string): Promise<boolean> {
  const categoryRef = getCategoriesCollection(spaceId).doc(categoryId);
  const doc = await categoryRef.get();

  if (!doc.exists) return false;

  const category = doc.data() as Category;

  // Cannot delete default categories
  if (category.isDefault) {
    throw new Error('Non puoi eliminare una categoria predefinita');
  }

  await categoryRef.delete();
  return true;
}

/**
 * Reorder categories
 */
export async function reorderCategories(spaceId: string, orderedIds: string[]): Promise<void> {
  const batch = firestore().batch();

  orderedIds.forEach((id, index) => {
    const ref = getCategoriesCollection(spaceId).doc(id);
    batch.update(ref, {
      sortOrder: index,
      updatedAt: new Date().toISOString(),
    });
  });

  await batch.commit();
}

/**
 * Seed default categories for a new space
 */
export async function seedDefaultCategories(spaceId: string): Promise<Category[]> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  // Check if categories already exist
  const existing = await getCategories(spaceId);
  if (existing.length > 0) {
    return existing;
  }

  const now = new Date().toISOString();
  const batch = firestore().batch();
  const categories: Category[] = [];

  // Add expense categories
  DEFAULT_EXPENSE_CATEGORIES.forEach((cat, index) => {
    const docRef = getCategoriesCollection(spaceId).doc();
    const categoryData = {
      spaceId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      isDefault: true,
      sortOrder: index,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(docRef, categoryData);
    categories.push({ id: docRef.id, ...categoryData });
  });

  // Add income categories
  DEFAULT_INCOME_CATEGORIES.forEach((cat, index) => {
    const docRef = getCategoriesCollection(spaceId).doc();
    const categoryData = {
      spaceId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      isDefault: true,
      sortOrder: index,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(docRef, categoryData);
    categories.push({ id: docRef.id, ...categoryData });
  });

  await batch.commit();

  return categories;
}

/**
 * Real-time listener for categories in a space
 */
export function onCategoriesChanged(
  spaceId: string,
  callback: (categories: Category[]) => void
): () => void {
  return getCategoriesCollection(spaceId)
    .orderBy('sortOrder', 'asc')
    .onSnapshot(snapshot => {
      const categories: Category[] = [];
      snapshot.forEach(doc => {
        categories.push({
          id: doc.id,
          ...doc.data(),
        } as Category);
      });
      callback(categories);
    }, error => {
      console.error('Error listening to categories:', error);
      callback([]);
    });
}

/**
 * Batch delete all categories in a space (used when deleting a space)
 */
export async function deleteAllCategoriesInSpace(spaceId: string): Promise<void> {
  const snapshot = await getCategoriesCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
