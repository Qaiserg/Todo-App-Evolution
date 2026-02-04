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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#000] pb-20">
      {/* Microsoft-style diagonal panels background */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e3a] via-[#141428] to-[#0a0a18]"></div>

        {/* Diagonal angular panels */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1920 1080">
          <defs>
            <linearGradient id="panel1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a3a6a" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#2a2a4e" stopOpacity="0.35"/>
            </linearGradient>
            <linearGradient id="panel2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#353565" stopOpacity="0.65"/>
              <stop offset="100%" stopColor="#25254a" stopOpacity="0.4"/>
            </linearGradient>
            <linearGradient id="panel3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2f2f5a" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#1a1a3a" stopOpacity="0.45"/>
            </linearGradient>
            <linearGradient id="panel4" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d3d70" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#2a2a55" stopOpacity="0.25"/>
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
          <polygon points="600,0 700,0 1920,900 1920,800" fill="#2e2e5a" fillOpacity="0.4"/>

          {/* Another subtle diagonal */}
          <polygon points="0,400 100,400 1920,1000 1920,1080 0,500" fill="#2a2a52" fillOpacity="0.35"/>
        </svg>

        {/* Soft glow accents */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#3a3a7a] rounded-full blur-[150px] opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-[#2a2a6a] rounded-full blur-[150px] opacity-25"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#4a4a8a] rounded-full blur-[200px] opacity-20"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-[360px] max-w-[calc(100%-24px)]">
        <div className="bg-[#2d2d2d] rounded shadow-2xl px-8 py-6">
          {/* Back button */}
          <button
            onClick={() => router.push('/welcome')}
            className="text-[#4da6ff] hover:underline text-xs mb-3 inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg width="28" height="28" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="barGradientL1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
                <linearGradient id="barGradientL2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="barGradientL3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="checkGradientL" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
              </defs>
              <rect x="2" y="10" width="20" height="6" rx="3" fill="url(#barGradientL3)" />
              <rect x="2" y="22" width="20" height="6" rx="3" fill="url(#barGradientL2)" />
              <rect x="2" y="34" width="20" height="6" rx="3" fill="url(#barGradientL1)" />
              <path d="M28 28 L33 33 L46 16" stroke="url(#checkGradientL)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M46 16 L47 14" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
            <span className="text-lg font-semibold text-white">Todo App</span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-white mb-4">
            {isLogin ? 'Sign in' : 'Create Account'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email field */}
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="peer w-full px-2.5 pt-4 pb-1 bg-[#1d1d1d] border border-[#5a5a5a] rounded-sm focus:outline-none focus:border-[#4da6ff] text-white text-xs placeholder-transparent"
                placeholder="Email"
              />
              <label
                htmlFor="email"
                className="absolute left-2.5 top-1 text-[9px] text-[#9a9a9a] transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-xs peer-focus:top-1 peer-focus:text-[9px]"
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
                  className="peer w-full px-2.5 pt-4 pb-1 bg-[#1d1d1d] border border-[#5a5a5a] rounded-sm focus:outline-none focus:border-[#4da6ff] text-white text-xs placeholder-transparent"
                  placeholder="Name"
                />
                <label
                  htmlFor="name"
                  className="absolute left-2.5 top-1 text-[9px] text-[#9a9a9a] transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-xs peer-focus:top-1 peer-focus:text-[9px]"
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
                className="peer w-full px-2.5 pt-4 pb-1 bg-[#1d1d1d] border border-[#5a5a5a] rounded-sm focus:outline-none focus:border-[#4da6ff] text-white text-xs placeholder-transparent"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-2.5 top-1 text-[9px] text-[#9a9a9a] transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-xs peer-focus:top-1 peer-focus:text-[9px]"
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
              className="w-full py-2 bg-[#0078d4] text-white rounded-sm hover:bg-[#006cbe] transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle signup/signin */}
          <div className="mt-4 text-xs">
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
