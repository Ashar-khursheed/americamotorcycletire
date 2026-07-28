'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@bmgcycles.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@bmgcycles.com' && password === 'admin123') {
        localStorage.setItem('bmg_admin_token', 'token_bmg_admin_secure_99');
        localStorage.setItem('bmg_admin_user', JSON.stringify({ name: 'Master Admin', email }));
        router.push('/admin');
      } else {
        setError('Invalid admin credentials. (Demo: admin@bmgcycles.com / admin123)');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#222] p-8 sm:p-10 rounded-xl max-w-md w-full shadow-2xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full border-2 border-[#BF8647]/60 bg-[#1A1A1A] mx-auto flex items-center justify-center overflow-hidden shadow-xl shadow-[#BF8647]/20">
            <img src="/bmg-logo.webp" alt="BMG CYCLES FREMONT CA" className="w-full h-full object-cover scale-110" />
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wider text-white">
            BMG CYCLES <span className="text-[#BF8647]">ADMIN</span>
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Management Portal Login
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded text-center uppercase font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold uppercase">
          <div>
            <label className="block text-gray-400 font-bold mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <div className="bg-[#181510] border border-[#BF8647]/30 p-3 rounded text-[11px] text-gray-400">
            <span className="text-[#BF8647] font-bold">DEMO CREDENTIALS:</span> admin@bmgcycles.com / admin123
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#BF8647] text-black font-extrabold uppercase py-3.5 rounded hover:bg-[#D49A50] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In To Admin Portal'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1C1C1C]">
          <Link href="/" className="text-xs text-gray-500 hover:text-[#BF8647] uppercase font-bold">
            ← Return to Public Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
