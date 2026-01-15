'use client';

import { FilterType, Task, User } from '@/lib/types';

interface SidebarProps {
  tasks: Task[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({
  tasks,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  user,
  onLogout
}: SidebarProps) {
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

  const filters: { key: FilterType; label: string; icon: JSX.Element }[] = [
    {
      key: 'today',
      label: 'My Day',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      key: 'upcoming',
      label: 'Planned',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const handleLogout = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLogout();
  };

  return (
    <aside className="w-56 min-h-screen flex flex-col py-4 px-3">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <svg width="36" height="36" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="10" width="20" height="6" rx="3" fill="#7dd3fc" />
          <rect x="2" y="22" width="20" height="6" rx="3" fill="#38bdf8" />
          <rect x="2" y="34" width="20" height="6" rx="3" fill="#0ea5e9" />
          <path d="M28 28 L33 33 L46 16" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M46 16 L47 14" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Filters */}
      <nav className="flex-1 min-h-0" aria-label="Task filters">
        <ul className="space-y-1">
          {filters.map((filter) => (
            <li key={filter.key}>
              <button
                onClick={() => onFilterChange(filter.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  activeFilter === filter.key
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className={activeFilter === filter.key ? 'text-blue-400' : 'text-slate-400'}>
                  {filter.icon}
                </span>
                <span>{filter.label}</span>
                {counts[filter.key] > 0 && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    activeFilter === filter.key ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {counts[filter.key]}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile - Fixed at bottom */}
      {user && (
        <div className="pt-3 mt-auto border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            onTouchEnd={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/50 active:bg-slate-700/50 transition-colors group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-red-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
