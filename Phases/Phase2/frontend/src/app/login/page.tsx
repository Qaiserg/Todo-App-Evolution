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
    <div className="min-h-screen flex flex-col bg-[#1b1b1b]">
      {/* Abstract background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1b1b1b]"></div>
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d3561" />
              <stop offset="100%" stopColor="#1b1b2f" />
            </linearGradient>
          </defs>
          <path d="M0,400 Q400,300 800,450 T1600,400 L1920,1080 L0,1080 Z" fill="url(#grad1)" opacity="0.5"/>
          <path d="M0,500 Q500,400 1000,550 T1920,500 L1920,1080 L0,1080 Z" fill="#252540" opacity="0.4"/>
          <path d="M0,600 Q600,500 1200,650 T1920,600 L1920,1080 L0,1080 Z" fill="#1f1f35" opacity="0.3"/>
        </svg>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-[440px] bg-[#2f2f2f] rounded-md shadow-2xl">
          <div className="p-11">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-4 h-4 bg-[#f25022]"></div>
                <div className="w-4 h-4 bg-[#7fba00]"></div>
                <div className="w-4 h-4 bg-[#00a4ef]"></div>
                <div className="w-4 h-4 bg-[#ffb900]"></div>
              </div>
              <span className="text-[22px] font-normal text-white">Todo App</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-white mb-2">
              {isLogin ? 'Sign in' : 'Create account'}
            </h1>
            <p className="text-[#8a8a8a] text-[15px] mb-6">
              {isLogin ? 'Use your Todo App account.' : 'Get started for free.'}
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
                  className="peer w-full px-3 pt-5 pb-2 bg-[#1b1b1b] border border-[#666] rounded-[4px] focus:outline-none focus:border-[#0078d4] text-white text-[15px] placeholder-transparent"
                  placeholder="Email"
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-1 text-[11px] text-[#8a8a8a] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-1 peer-focus:text-[11px]"
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
                    className="peer w-full px-3 pt-5 pb-2 bg-[#1b1b1b] border border-[#666] rounded-[4px] focus:outline-none focus:border-[#0078d4] text-white text-[15px] placeholder-transparent"
                    placeholder="Name"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-3 top-1 text-[11px] text-[#8a8a8a] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-1 peer-focus:text-[11px]"
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
                  className="peer w-full px-3 pt-5 pb-2 bg-[#1b1b1b] border border-[#666] rounded-[4px] focus:outline-none focus:border-[#0078d4] text-white text-[15px] placeholder-transparent"
                  placeholder="Password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-3 top-1 text-[11px] text-[#8a8a8a] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-1 peer-focus:text-[11px]"
                >
                  Password
                </label>
              </div>

              {/* Forgot password link */}
              {isLogin && (
                <div>
                  <button type="button" className="text-[13px] text-[#4da6ff] hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#0078d4] text-white rounded-[4px] hover:bg-[#006cbe] transition-colors font-normal text-[15px] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {/* Toggle signup/signin */}
            <div className="mt-8 text-[13px]">
              <span className="text-[#8a8a8a]">
                {isLogin ? 'No account? ' : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#4da6ff] hover:underline"
              >
                {isLogin ? 'Create one!' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <div className="flex items-center justify-center gap-6 text-[12px] text-[#8a8a8a]">
          <button
            onClick={() => router.push('/welcome')}
            className="hover:underline"
          >
            Back to home
          </button>
          <span className="hover:underline cursor-pointer">Terms of use</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
        </div>
      </footer>
    </div>
  );
}
