'use client';

import { Task, TaskPriority } from '@/lib/types';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: number, title: string, description: string | null, priority: TaskPriority) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
}

export default function TaskCard({
  task,
  onUpdate,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority || 'medium');

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle.trim(), editDescription.trim() || null, editPriority);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    setIsEditing(false);
  };

  const isCompleted = task.status === 'completed';

  const priorityConfig: Record<string, { color: string; dot: string }> = {
    high: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
    low: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  };

  // Default to medium if priority is undefined (for old tasks)
  const taskPriority = task.priority || 'medium';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`group rounded-xl shadow-sm border hover:shadow-md transition-all p-4 ${
        isCompleted
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          : 'bg-white'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="Task title"
            aria-label="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="Description (optional)"
            aria-label="Task description"
            rows={2}
          />
          <div className="flex gap-2" role="group" aria-label="Task priority">
            {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setEditPriority(p)}
                aria-pressed={editPriority === p}
                className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                  editPriority === p
                    ? priorityConfig[p].color
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task.id)}
            aria-label={isCompleted ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
            aria-pressed={isCompleted}
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-500 shadow-sm shadow-green-200'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            {isCompleted && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-medium truncate ${
                  isCompleted ? 'text-green-700' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
              {/* Priority Badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${priorityConfig[taskPriority].color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[taskPriority].dot}`}></span>
                {taskPriority}
              </span>
            </div>

            {task.description && (
              <p className={`text-sm line-clamp-2 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </span>
              )}
              {task.due_date && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(task.due_date)}
                </span>
              )}
              <span>
                Created {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" role="group" aria-label="Task actions">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label={`Edit task "${task.title}"`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`Delete task "${task.title}"`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
