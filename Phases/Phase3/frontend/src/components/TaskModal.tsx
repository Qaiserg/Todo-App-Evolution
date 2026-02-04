'use client';

import { useState } from 'react';
import { TaskPriority } from '@/lib/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string | null, priority: TaskPriority, dueDate: string | null) => void;
}

export default function TaskModal({ isOpen, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    onSubmit(
      title.trim(),
      description.trim() || null,
      priority,
      dueDate || null
    );

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    onClose();
  };

  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10 text-red-400',
    medium: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    low: 'border-green-500/50 bg-green-500/10 text-green-400',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md transform transition-all" role="document">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            <h2 id="modal-title" className="text-lg font-semibold text-white">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                placeholder="Add some details (optional)"
                rows={3}
              />
            </div>

            {/* Priority */}
            <fieldset>
              <legend className="block text-sm font-medium text-slate-300 mb-2">Priority</legend>
              <div className="flex gap-2" role="group" aria-label="Task priority">
                {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    aria-pressed={priority === p}
                    className={`flex-1 py-2 px-3 rounded-lg border font-medium capitalize transition-colors text-sm ${
                      priority === p
                        ? priorityColors[p]
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1.5">
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white [color-scheme:dark]"
              />
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-2 rounded-lg">{error}</div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
