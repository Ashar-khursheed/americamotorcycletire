'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, Lock, User } from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('bmg_customer_user', JSON.stringify({ name, email }));
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
              <span className="text-xs text-[#BF8647] font-bold uppercase tracking-widest">JOIN BMG CYCLES</span>
              <h1 className="text-2xl font-extrabold uppercase text-white">CREATE RIDER ACCOUNT</h1>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold uppercase">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
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
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-[#1C1C1C] text-xs text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#BF8647] font-bold uppercase hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
