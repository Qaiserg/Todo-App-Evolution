'use client';

interface EmptyStateProps {
  filter: string;
  onAddTask: () => void;
}

export default function EmptyState({ filter, onAddTask }: EmptyStateProps) {
  const messages: Record<string, { title: string; description: string }> = {
    all: {
      title: 'No tasks yet!',
      description: 'Get started by creating your first task.',
    },
    today: {
      title: 'Nothing due today',
      description: 'Enjoy your free time or plan ahead!',
    },
    upcoming: {
      title: 'No upcoming tasks',
      description: 'Schedule some tasks for the future.',
    },
    completed: {
      title: 'No completed tasks',
      description: 'Complete some tasks to see them here.',
    },
    high: {
      title: 'No high priority tasks',
      description: 'Great! No urgent tasks to worry about.',
    },
    medium: {
      title: 'No medium priority tasks',
      description: 'Add tasks with medium priority.',
    },
    low: {
      title: 'No low priority tasks',
      description: 'Add some tasks for later.',
    },
  };

  const { title, description } = messages[filter] || messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Illustration */}
      <div className="w-32 h-32 mb-6 text-slate-700" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <rect x="30" y="40" width="140" height="120" rx="8" fill="currentColor" />
          <rect x="45" y="60" width="80" height="8" rx="4" fill="#334155" />
          <rect x="45" y="80" width="110" height="6" rx="3" fill="#334155" />
          <rect x="45" y="95" width="90" height="6" rx="3" fill="#334155" />
          <circle cx="160" cy="64" r="8" fill="#3b82f6" opacity="0.4" />
          <rect x="45" y="120" width="70" height="8" rx="4" fill="#334155" />
          <rect x="45" y="138" width="100" height="6" rx="3" fill="#334155" />
          <circle cx="160" cy="124" r="8" fill="#22c55e" opacity="0.4" />
        </svg>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-center text-sm mb-6 max-w-sm">{description}</p>

      {/* CTA Button */}
      {filter !== 'completed' && (
        <button
          onClick={onAddTask}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
          aria-label="Add your first task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Your First Task
        </button>
      )}
    </div>
  );
}
