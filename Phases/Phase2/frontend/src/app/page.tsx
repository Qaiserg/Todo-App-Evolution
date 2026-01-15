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
import ProgressCircle from '@/components/ProgressCircle';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      setSelectedTask(null);
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
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: task.status } : t))
      );
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      toast.error(message);
    }
  };

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let result = tasks;

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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px]"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 flex h-screen">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Glassmorphism card container */}
        <div className="flex w-full bg-slate-900/40 backdrop-blur-xl overflow-hidden">
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-50 bg-slate-900/95 backdrop-blur-xl transform lg:relative lg:translate-x-0 transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Sidebar
              tasks={tasks}
              activeFilter={filter}
              onFilterChange={(f) => { setFilter(f); setSidebarOpen(false); }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              user={user}
              onLogout={handleLogout}
            />
          </div>

          {/* Main content */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800/50">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Progress Circle */}
                <ProgressCircle percentage={completionPercentage} size={70} />
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-500/50 transition-all font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add task</span>
              </button>
            </header>

            {/* Error */}
            {error && (
              <div className="mx-4 lg:mx-6 mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-5">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-slate-700 rounded w-1/2" />
                        </div>
                        <div className="w-6 h-6 bg-slate-700 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <EmptyState filter={filter} onAddTask={() => setShowModal(true)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      onToggleComplete={handleToggleComplete}
                      onSelect={setSelectedTask}
                      isSelected={selectedTask?.id === task.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Details Panel - shows when task is selected */}
          {selectedTask && (
            <div className="hidden lg:block w-72 border-l border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-1">{selectedTask.title}</h4>
                  <p className="text-sm text-blue-400">
                    {selectedTask.status === 'completed' ? 'Completed' :
                     selectedTask.priority === 'high' ? 'High Priority' : 'In Progress'}
                  </p>
                </div>

                {selectedTask.due_date && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Due Date</p>
                    <p className="text-sm text-white">
                      {new Date(selectedTask.due_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {selectedTask.description && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Notes</p>
                    <p className="text-sm text-slate-300">{selectedTask.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    selectedTask.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {selectedTask.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleToggleComplete(selectedTask.id)}
                    className="flex-1 py-2 px-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                  >
                    {selectedTask.status === 'completed' ? 'Reopen' : 'Complete'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="py-2 px-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
