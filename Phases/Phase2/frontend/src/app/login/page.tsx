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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      {/* Abstract background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#0a0a12] to-[#050508]"></div>
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <path d="M-100,700 C200,650 400,750 700,700 S1000,600 1300,680 S1600,720 1920,650 L1920,1080 L0,1080 Z" fill="#1a1a2e" opacity="0.6"/>
          <path d="M-100,750 C300,700 500,800 800,750 S1100,650 1400,730 S1700,770 2020,700 L1920,1080 L0,1080 Z" fill="#151525" opacity="0.5"/>
          <path d="M-100,800 C400,750 600,850 900,800 S1200,700 1500,780 S1800,820 2020,750 L1920,1080 L0,1080 Z" fill="#101020" opacity="0.4"/>
        </svg>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 500 1000" preserveAspectRatio="none">
            <line x1="100" y1="0" x2="500" y2="400" stroke="#3a3a5c" strokeWidth="1"/>
            <line x1="200" y1="0" x2="600" y2="400" stroke="#3a3a5c" strokeWidth="1"/>
            <line x1="0" y1="200" x2="400" y2="600" stroke="#3a3a5c" strokeWidth="1"/>
          </svg>
        </div>
      </div>

      {/* Card - compact size */}
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
                className="peer w-full px-3 pt-5 pb-1.5 bg-[#1d1d1d] border border-[#5a5a5a] rounded focus:outline-none focus:border-[#4da6ff] text-white text-sm placeholder-transparent"
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
                  className="peer w-full px-3 pt-5 pb-1.5 bg-[#1d1d1d] border border-[#5a5a5a] rounded focus:outline-none focus:border-[#4da6ff] text-white text-sm placeholder-transparent"
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
                className="peer w-full px-3 pt-5 pb-1.5 bg-[#1d1d1d] border border-[#5a5a5a] rounded focus:outline-none focus:border-[#4da6ff] text-white text-sm placeholder-transparent"
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
              className="w-full py-2.5 bg-[#0067b8] text-white rounded hover:bg-[#005da6] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
