'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If already logged in, go to home
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Stars background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-1 h-1 bg-white rounded-full opacity-40"></div>
        <div className="absolute top-40 left-1/4 w-1 h-1 bg-white rounded-full opacity-30"></div>
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-white rounded-full opacity-50"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-white rounded-full opacity-40"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-20"></div>
        <div className="absolute top-48 right-1/4 w-1 h-1 bg-white rounded-full opacity-35"></div>
        <div className="absolute top-24 left-1/2 w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
        <div className="absolute top-72 right-1/2 w-1 h-1 bg-white rounded-full opacity-25"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            {/* Task list + checkmark logo */}
            <svg width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="barGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
                <linearGradient id="barGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="barGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="checkGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
              </defs>
              {/* Three horizontal bars with depth */}
              <rect x="2" y="10" width="20" height="6" rx="3" fill="url(#barGradient3)" />
              <rect x="2" y="22" width="20" height="6" rx="3" fill="url(#barGradient2)" />
              <rect x="2" y="34" width="20" height="6" rx="3" fill="url(#barGradient1)" />
              {/* Stylized checkmark with sharp tip */}
              <path d="M28 28 L33 33 L46 16" stroke="url(#checkGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M46 16 L47 14" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
            <span className="text-xl font-semibold text-white">Todo App</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-blue-300 hover:text-blue-200 font-medium transition-colors"
          >
            Sign In
          </button>
        </nav>

        {/* Hero */}
        <div className="text-center py-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            Organize your tasks,
          </h1>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-400 mb-8">
            simplify your life
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            A simple, beautiful task manager to help you stay organized and productive.
            Create tasks, set priorities, and due dates, and get things done.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
          >
            Get Started - It&apos;s Free
          </button>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 backdrop-blur p-6 rounded-2xl border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Easy Task Management</h3>
            <p className="text-slate-400">Create, edit, and organize tasks with just a few clicks.</p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur p-6 rounded-2xl border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Due Dates & Priorities</h3>
            <p className="text-slate-400">Set deadlines and priorities to stay on top of what matters.</p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur p-6 rounded-2xl border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-slate-400">Mark tasks complete and see your accomplishments grow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
