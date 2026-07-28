'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, Lock, UserCheck } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('bmg_customer_user', JSON.stringify({
        name: email.split('@')[0].toUpperCase(),
        email,
      }));
      router.push('/account');
    }, 500);
  };

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-[#121212] border border-[#222] p-8 rounded-xl space-y-6 shadow-2xl">
            <div className="text-center space-y-1">
              <span className="text-xs text-[#BF8647] font-bold uppercase tracking-widest">CUSTOMER PORTAL</span>
              <h1 className="text-2xl font-extrabold uppercase text-white">SIGN IN TO YOUR ACCOUNT</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold uppercase">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@example.com"
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#BF8647] text-black font-extrabold uppercase py-3.5 rounded hover:bg-[#D49A50] transition-colors"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-[#1C1C1C] text-xs text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#BF8647] font-bold uppercase hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
