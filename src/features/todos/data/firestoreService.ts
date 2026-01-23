/**
 * Todos Firestore Service
 * Persiste i todos nella subcollection spaces/{spaceId}/todos
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Todo, CreateTodoPayload, UpdateTodoPayload, TodoStatus } from '../domain/types';

/**
 * Get the todos collection for a specific space
 */
function getTodosCollection(spaceId: string) {
  return firestore().collection('spaces').doc(spaceId).collection('todos');
}

/**
 * Get all todos for a space
 */
export async function getTodos(spaceId: string): Promise<Todo[]> {
  const snapshot = await getTodosCollection(spaceId).orderBy('createdAt', 'desc').get();

  const todos: Todo[] = [];
  snapshot.forEach(doc => {
    todos.push({
      id: doc.id,
      ...doc.data(),
    } as Todo);
  });

  return todos;
}

/**
 * Get a single todo by ID
 */
export async function getTodoById(spaceId: string, todoId: string): Promise<Todo | null> {
  const doc = await getTodosCollection(spaceId).doc(todoId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Todo;
}

/**
 * Create a new todo
 */
export async function createTodo(spaceId: string, payload: CreateTodoPayload): Promise<Todo> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const now = new Date().toISOString();

  const todoData = {
    spaceId,
    title: payload.title,
    description: payload.description || '',
    status: payload.status || 'todo',
    priority: payload.priority || 'medium',
    dueDate: payload.dueDate || null,
    tags: payload.tags || [],
    createdBy: currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await getTodosCollection(spaceId).add(todoData);

  return {
    id: docRef.id,
    ...todoData,
  };
}

/**
 * Update a todo
 */
export async function updateTodo(spaceId: string, payload: UpdateTodoPayload): Promise<Todo | null> {
  const todoRef = getTodosCollection(spaceId).doc(payload.id);
  const doc = await todoRef.get();

  if (!doc.exists) return null;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.priority !== undefined) updates.priority = payload.priority;
  if (payload.dueDate !== undefined) updates.dueDate = payload.dueDate;
  if (payload.tags !== undefined) updates.tags = payload.tags;

  await todoRef.update(updates);

  const updatedDoc = await todoRef.get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Todo;
}

/**
 * Delete a todo
 */
export async function deleteTodo(spaceId: string, todoId: string): Promise<boolean> {
  const todoRef = getTodosCollection(spaceId).doc(todoId);
  const doc = await todoRef.get();

  if (!doc.exists) return false;

  await todoRef.delete();
  return true;
}

/**
 * Toggle todo status (todo -> doing -> done -> todo)
 */
export async function toggleTodoStatus(spaceId: string, todoId: string): Promise<Todo | null> {
  const todo = await getTodoById(spaceId, todoId);
  if (!todo) return null;

  const nextStatus: Record<TodoStatus, TodoStatus> = {
    todo: 'doing',
    doing: 'done',
    done: 'todo',
  };

  return updateTodo(spaceId, {
    id: todoId,
    status: nextStatus[todo.status],
  });
}

/**
 * Mark todo as done
 */
export async function markTodoAsDone(spaceId: string, todoId: string): Promise<Todo | null> {
  return updateTodo(spaceId, { id: todoId, status: 'done' });
}

/**
 * Get all unique tags for a space
 */
export async function getAllTags(spaceId: string): Promise<string[]> {
  const todos = await getTodos(spaceId);
  const tags = new Set<string>();

  todos.forEach(todo => {
    todo.tags.forEach(tag => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Real-time listener for todos in a space
 */
export function onTodosChanged(
  spaceId: string,
  callback: (todos: Todo[]) => void
): () => void {
  return getTodosCollection(spaceId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const todos: Todo[] = [];
      snapshot.forEach(doc => {
        todos.push({
          id: doc.id,
          ...doc.data(),
        } as Todo);
      });
      callback(todos);
    }, error => {
      console.error('Error listening to todos:', error);
      callback([]);
    });
}

/**
 * Batch delete all todos in a space (used when deleting a space)
 */
export async function deleteAllTodosInSpace(spaceId: string): Promise<void> {
  const snapshot = await getTodosCollection(spaceId).get();

  if (snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
