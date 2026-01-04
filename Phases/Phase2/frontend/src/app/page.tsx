'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Task, TaskPriority, FilterType } from '@/lib/types';
import { taskApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import EmptyState from '@/components/EmptyState';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect to welcome if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
    }
  }, [authLoading, user, router]);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      // Don't show error for auth issues (expected during logout)
      if (message !== 'Not authenticated') {
        setError(message);
        toast.error('Could not connect to server');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [loadTasks, user]);

  const handleLogout = () => {
    logout();
    router.push('/welcome');
  };

  const handleAddTask = async (
    title: string,
    description: string | null,
    priority: TaskPriority,
    dueDate: string | null
  ) => {
    try {
      setError(null);
      const newTask = await taskApi.create({ title, description, priority, due_date: dueDate });
      setTasks((prev) => [...prev, newTask]);
      toast.success('Task created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setError(message);
      toast.error(message);
    }
  };

  const handleUpdateTask = async (
    id: number,
    title: string,
    description: string | null,
    priority: TaskPriority
  ) => {
    try {
      setError(null);
      const updatedTask = await taskApi.update(id, { title, description, priority });
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      toast.success('Task updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      toast.error(message);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      setError(null);
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success('Task deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      toast.error(message);
    }
  };

  const handleToggleComplete = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic update
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      setError(null);
      if (task.status === 'pending') {
        await taskApi.markComplete(id);
        toast.success('Task completed!');
      } else {
        await taskApi.update(id, { status: 'pending' });
        toast.success('Task reopened');
      }
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: task.status } : t))
      );
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      toast.error(message);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    // Use local date instead of UTC to fix timezone issues
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let result = tasks;

    // Apply filter
    switch (filter) {
      case 'today':
        result = tasks.filter((t) => t.due_date === today && t.status === 'pending');
        break;
      case 'upcoming':
        result = tasks.filter((t) => t.due_date && t.due_date > today && t.status === 'pending');
        break;
      case 'completed':
        result = tasks.filter((t) => t.status === 'completed');
        break;
      case 'high':
      case 'medium':
      case 'low':
        result = tasks.filter((t) => t.priority === filter && t.status === 'pending');
        break;
      default:
        result = tasks.filter((t) => t.status === 'pending');
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tasks, filter, searchQuery]);

  const filterLabels: Record<FilterType, string> = {
    all: 'All Tasks',
    today: 'Today',
    upcoming: 'Upcoming',
    completed: 'Completed',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar tasks={tasks} activeFilter={filter} onFilterChange={(f) => { setFilter(f); setSidebarOpen(false); }} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-1.5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700"
                aria-label="Open sidebar menu"
                aria-expanded={sidebarOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{filterLabels[filter]}</h1>
            </div>

            {/* Search and Add */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 w-56 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  aria-label="Search tasks"
                />
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                aria-label="Create new task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Task</span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline text-sm">{user?.name}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 sm:hidden">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                aria-label="Search tasks"
              />
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div role="alert" className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            // Skeleton loading
            <div className="space-y-3" aria-label="Loading tasks" role="status">
              <span className="sr-only">Loading tasks...</span>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse" aria-hidden="true">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState filter={filter} onAddTask={() => setShowModal(true)} />
          ) : (
            <div className="space-y-3" role="list" aria-label="Task list">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
