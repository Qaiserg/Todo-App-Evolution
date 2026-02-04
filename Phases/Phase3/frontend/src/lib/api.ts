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

  async markReminded(id: number): Promise<Task> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/tasks/${id}/reminded`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
    });
    return handleResponse<Task>(response);
  },
};

// Chat API types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  tool_calls: Array<{
    tool: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
  }>;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Chat API
export const chatApi = {
  async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/chat`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });
    return handleResponse<ChatResponse>(response);
  },

  async getConversations(): Promise<Conversation[]> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/conversations`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse<Conversation[]>(response);
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/conversations/${conversationId}/messages`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse<ChatMessage[]>(response);
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/api/${userId}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};
