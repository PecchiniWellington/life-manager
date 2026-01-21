/**
 * Shared Types
 */

/**
 * Generic entity with ID
 */
export interface Entity {
  id: string;
}

/**
 * Timestamped entity
 */
export interface TimestampedEntity extends Entity {
  createdAt: string;
  updatedAt: string;
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Async state for Redux slices
 */
export interface AsyncState {
  status: LoadingState;
  error: string | null;
}

/**
 * Normalized state for entities
 */
export interface NormalizedState<T extends Entity> extends AsyncState {
  ids: string[];
  entities: Record<string, T>;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * Filter base
 */
export interface FilterBase {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Sort config
 */
export interface SortConfig<T = string> {
  field: T;
  direction: 'asc' | 'desc';
}
