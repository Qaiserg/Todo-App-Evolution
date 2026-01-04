'use client';

import { FilterType, Task } from '@/lib/types';

interface SidebarProps {
  tasks: Task[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function Sidebar({ tasks, activeFilter, onFilterChange }: SidebarProps) {
  // Use local date instead of UTC to fix timezone issues
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const counts = {
    all: tasks.filter(t => t.status === 'pending').length,
    today: tasks.filter(t => t.due_date === today && t.status === 'pending').length,
    upcoming: tasks.filter(t => t.due_date && t.due_date > today && t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    high: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
    medium: tasks.filter(t => t.priority === 'medium' && t.status === 'pending').length,
    low: tasks.filter(t => t.priority === 'low' && t.status === 'pending').length,
  };

  const filters: { key: FilterType; label: string; icon: JSX.Element; color?: string }[] = [
    {
      key: 'all',
      label: 'All Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      key: 'today',
      label: 'Today',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'upcoming',
      label: 'Upcoming',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const priorityFilters: { key: FilterType; label: string; color: string }[] = [
    { key: 'high', label: 'High Priority', color: 'bg-red-500' },
    { key: 'medium', label: 'Medium Priority', color: 'bg-yellow-500' },
    { key: 'low', label: 'Low Priority', color: 'bg-green-500' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo - matches main header height */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Todo App
        </h1>
      </div>

      {/* Smart Filters */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Task filters">
        <p id="filters-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filters</p>
        <ul className="space-y-1" role="listbox" aria-labelledby="filters-label">
          {filters.map((filter) => (
            <li key={filter.key} role="option" aria-selected={activeFilter === filter.key}>
              <button
                onClick={() => onFilterChange(filter.key)}
                aria-current={activeFilter === filter.key ? 'true' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  {filter.icon}
                  {filter.label}
                </span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  activeFilter === filter.key ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {counts[filter.key]}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Priority Filters */}
        <p id="priority-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-6">Priority</p>
        <ul className="space-y-1" role="listbox" aria-labelledby="priority-label">
          {priorityFilters.map((filter) => (
            <li key={filter.key} role="option" aria-selected={activeFilter === filter.key}>
              <button
                onClick={() => onFilterChange(filter.key)}
                aria-current={activeFilter === filter.key ? 'true' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${filter.color}`}></span>
                  {filter.label}
                </span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  activeFilter === filter.key ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {counts[filter.key]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
