'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData.email, formData.name, formData.password);
        toast.success('Account created!');
      }
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#000]">
      {/* Microsoft-style diagonal panels background */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1a] to-[#0a0a12]"></div>

        {/* Diagonal angular panels */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1920 1080">
          <defs>
            <linearGradient id="panel1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a4a" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0.2"/>
            </linearGradient>
            <linearGradient id="panel2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#252545" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#15152a" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="panel3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f1f3a" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#101025" stopOpacity="0.4"/>
            </linearGradient>
            <linearGradient id="panel4" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d2d50" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#1a1a35" stopOpacity="0.1"/>
            </linearGradient>
          </defs>

          {/* Large diagonal panel from top-left */}
          <polygon points="0,0 800,0 400,1080 0,1080" fill="url(#panel1)"/>

          {/* Mid panel */}
          <polygon points="200,0 1000,0 600,1080 0,800" fill="url(#panel2)"/>

          {/* Right side panel */}
          <polygon points="1920,200 1920,1080 1200,1080 1500,200" fill="url(#panel3)"/>

          {/* Bottom right accent */}
          <polygon points="1920,600 1920,1080 1000,1080" fill="url(#panel4)"/>

          {/* Subtle crossing line */}
          <polygon points="600,0 700,0 1920,900 1920,800" fill="#1e1e3a" fillOpacity="0.3"/>

          {/* Another subtle diagonal */}
          <polygon points="0,400 100,400 1920,1000 1920,1080 0,500" fill="#1a1a32" fillOpacity="0.25"/>
        </svg>

        {/* Soft glow accents */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#2a2a5a] rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#1a1a4a] rounded-full blur-[150px] opacity-15"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-[360px] max-w-[calc(100%-24px)]">
        <div className="bg-[#2d2d2d] rounded shadow-2xl px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => router.push('/welcome')}
            className="text-[#4da6ff] hover:underline text-xs mb-4 inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            </div>
            <span className="text-lg font-semibold text-white">Todo App</span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-white mb-0.5">
            {isLogin ? 'Sign in' : 'Create Account'}
          </h1>
          <p className="text-[#9a9a9a] text-xs mb-6">
            {isLogin ? 'Use your Todo App account.' : 'Get started for free'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="peer w-full px-3 pt-5 pb-1.5 bg-[#1d1d1d] border border-[#5a5a5a] rounded-sm focus:outline-none focus:border-[#4da6ff] text-white text-sm placeholder-transparent"
                placeholder="Email"
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-1.5 text-[10px] text-[#9a9a9a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px]"
              >
                Email
              </label>
            </div>

            {/* Name field (signup only) */}
            {!isLogin && (
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="peer w-full px-3 pt-5 pb-1.5 bg-[#1d1d1d] border border-[#5a5a5a] rounded-sm focus:outline-none focus:border-[#4da6ff] text-white text-sm placeholder-transparent"
                  placeholder="Name"
                />
                <label
                  htmlFor="name"
                  className="absolute left-3 top-1.5 text-[10px] text-[#9a9a9a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px]"
                >
                  Name
                </label>
              </div>
            )}

            {/* Password field */}
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="peer w-full px-3 pt-5 pb-1.5 bg-[#1d1d1d] border border-[#5a5a5a] rounded-sm focus:outline-none focus:border-[#4da6ff] text-white text-sm placeholder-transparent"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-1.5 text-[10px] text-[#9a9a9a] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px]"
              >
                Password
              </label>
            </div>

            {/* Forgot password link */}
            {isLogin && (
              <div>
                <button type="button" className="text-xs text-[#4da6ff] hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0078d4] text-white rounded-sm hover:bg-[#006cbe] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle signup/signin */}
          <div className="mt-6 text-xs">
            <span className="text-[#9a9a9a]">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#4da6ff] hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
