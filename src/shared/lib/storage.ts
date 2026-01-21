/**
 * Storage Utilities
 * Wrapper per AsyncStorage con tipizzazione
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys enum per type safety
 */
export enum StorageKey {
  // Calendar
  CALENDAR_EVENTS = '@calendar/events',

  // Todos
  TODOS = '@todos/items',

  // Wallet
  WALLET_TRANSACTIONS = '@wallet/transactions',

  // Settings
  THEME_MODE = '@settings/theme',
  USER_PREFERENCES = '@settings/preferences',
}

/**
 * Get item from storage
 */
export async function getStorageItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

/**
 * Set item in storage
 */
export async function setStorageItem<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
    return false;
  }
}

/**
 * Remove item from storage
 */
export async function removeStorageItem(key: StorageKey): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
    return false;
  }
}

/**
 * Clear all storage (use with caution)
 */
export async function clearStorage(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

/**
 * Get multiple items
 */
export async function getMultipleItems<T>(
  keys: StorageKey[]
): Promise<Map<StorageKey, T | null>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result = new Map<StorageKey, T | null>();

    pairs.forEach(([key, value]) => {
      result.set(key as StorageKey, value ? JSON.parse(value) : null);
    });

    return result;
  } catch (error) {
    console.error('Error reading multiple items from storage:', error);
    return new Map();
  }
}

/**
 * Set multiple items
 */
export async function setMultipleItems<T>(
  items: [StorageKey, T][]
): Promise<boolean> {
  try {
    const pairs: [string, string][] = items.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Error writing multiple items to storage:', error);
    return false;
  }
}
