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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a14]">
      {/* Fluent Design Mesh Gradient Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1e] via-[#0a0a18] to-[#050510]"></div>

        {/* Soft blur blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#1a1a4e] rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-[10%] right-[-15%] w-[500px] h-[500px] bg-[#2d1f54] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] bg-[#1e2a5e] rounded-full blur-3xl opacity-35"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#3d2a6e] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-[#2a3a7e] rounded-full blur-3xl opacity-15"></div>

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-[360px] max-w-[calc(100%-24px)]">
        <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-lg shadow-2xl px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => router.push('/welcome')}
            className="text-[#6cb6ff] hover:text-[#8ecaff] text-xs mb-4 inline-flex items-center gap-1 transition-colors"
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
          <p className="text-[#a0a0a0] text-xs mb-6">
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
                className="peer w-full px-3 pt-5 pb-1.5 bg-black/30 border border-white/20 rounded-sm focus:outline-none focus:border-[#6cb6ff] text-white text-sm placeholder-transparent transition-colors"
                placeholder="Email"
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-1.5 text-[10px] text-[#a0a0a0] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px]"
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
                  className="peer w-full px-3 pt-5 pb-1.5 bg-black/30 border border-white/20 rounded-sm focus:outline-none focus:border-[#6cb6ff] text-white text-sm placeholder-transparent transition-colors"
                  placeholder="Name"
                />
                <label
                  htmlFor="name"
                  className="absolute left-3 top-1.5 text-[10px] text-[#a0a0a0] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px]"
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
                className="peer w-full px-3 pt-5 pb-1.5 bg-black/30 border border-white/20 rounded-sm focus:outline-none focus:border-[#6cb6ff] text-white text-sm placeholder-transparent transition-colors"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-1.5 text-[10px] text-[#a0a0a0] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px]"
              >
                Password
              </label>
            </div>

            {/* Forgot password link */}
            {isLogin && (
              <div>
                <button type="button" className="text-xs text-[#6cb6ff] hover:text-[#8ecaff] transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0078d4] text-white rounded-sm hover:bg-[#1a86d9] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle signup/signin */}
          <div className="mt-6 text-xs">
            <span className="text-[#a0a0a0]">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#6cb6ff] hover:text-[#8ecaff] transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
