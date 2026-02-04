'use client';

import { Task, TaskPriority } from '@/lib/types';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: number, title: string, description: string | null, priority: TaskPriority) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onSelect?: (task: Task) => void;
  isSelected?: boolean;
}

export default function TaskCard({
  task,
  onUpdate,
  onDelete,
  onToggleComplete,
  onSelect,
  isSelected,
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
  const taskPriority = task.priority || 'medium';

  const priorityConfig: Record<string, { dot: string; text: string; border: string }> = {
    high: { dot: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/50' },
    medium: { dot: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/50' },
    low: { dot: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/50' },
  };

  const getPriorityLabel = () => {
    if (taskPriority === 'high') return 'High Priority';
    if (taskPriority === 'low') return 'Low Priority';
    return 'Medium Priority';
  };

  return (
    <div
      onClick={() => onSelect?.(task)}
      className={`group rounded-xl border transition-all p-4 cursor-pointer ${
        isSelected
          ? 'bg-slate-700/50 border-blue-500/50'
          : isCompleted
          ? 'bg-slate-800/30 border-slate-700/30'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="flex gap-2">
            {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setEditPriority(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  editPriority === p
                    ? `${priorityConfig[p].border} ${priorityConfig[p].text} bg-slate-700/50`
                    : 'border-slate-600 text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${priorityConfig[p].dot}`}></span>
                <span className="capitalize">{p}</span>
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
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${isCompleted ? 'text-slate-400' : 'text-white'}`}>
              {task.title}
            </h3>
            <div className={`flex items-center gap-1.5 mt-1 text-sm ${isCompleted ? 'text-slate-500' : priorityConfig[taskPriority].text}`}>
              {!isCompleted && (
                <span className={`w-2 h-2 rounded-full ${priorityConfig[taskPriority].dot}`}></span>
              )}
              <span>
                {isCompleted ? 'Completed' : getPriorityLabel()}
              </span>
              {task.due_date && !isCompleted && (
                <span className="text-slate-500 ml-1">
                  &bull; Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              aria-label="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              aria-label="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              isCompleted
                ? 'bg-green-500 border-green-500'
                : 'border-slate-500 hover:border-blue-400 hover:bg-blue-500/10'
            }`}
          >
            {isCompleted && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
