/**
 * API client for the Todo backend.
 */

import { Task, TaskCreate, TaskUpdate, TaskStatus } from './types';
import { authClient } from './auth-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    // Get session and token from Better Auth
    const session = await authClient.getSession();
    if (session.data?.session) {
      // Fetch JWT token from Better Auth token endpoint
      const tokenResponse = await fetch('/api/auth/token', {
        method: 'GET',
        credentials: 'include',
      });
      if (tokenResponse.ok) {
        const { token } = await tokenResponse.json();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }

  return headers;
}

async function getUserId(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    return session.data?.user?.id || null;
  } catch {
    return null;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Task API with user_id in URL
export const taskApi = {
  async getAll(status?: TaskStatus): Promise<Task[]> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const url = status
      ? `${API_BASE}/api/${userId}/tasks?status_filter=${status}`
      : `${API_BASE}/api/${userId}/tasks`;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });
    return handleResponse<Task[]>(response);
  },

  async getById(id: number): Promise<Task> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/tasks/${id}`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse<Task>(response);
  },

  async create(task: TaskCreate): Promise<Task> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/tasks`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
  },

  async update(id: number, task: TaskUpdate): Promise<Task> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/tasks/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
  },

  async delete(id: number): Promise<void> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/tasks/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  async markComplete(id: number): Promise<Task> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
    });
    return handleResponse<Task>(response);
  },
};
