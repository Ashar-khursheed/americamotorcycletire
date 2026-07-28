'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { User, Package, LogOut, ShieldCheck } from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('bmg_customer_user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.push('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bmg_customer_user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Top Banner */}
          <div className="bg-[#121212] border border-[#222] p-8 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#BF8647] bg-[#1A1A1A] flex items-center justify-center text-[#BF8647] text-xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold uppercase text-white">{user.name}</h1>
                <p className="text-xs text-gray-400 font-mono">{user.email}</p>
                <span className="text-[10px] bg-[#BF8647] text-black font-black uppercase px-2 py-0.5 rounded mt-1 inline-block">
                  VERIFIED RIDER
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-[#1F1F1F] border border-[#333] hover:border-red-500 hover:text-red-400 text-gray-300 text-xs font-bold uppercase px-5 py-2.5 rounded flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Customer Dashboard Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-[#121212] border border-[#222] p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-[#BF8647] font-bold text-sm uppercase">
                <Package className="w-5 h-5" /> Recent Orders & Track Shipments
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Lookup your active tire orders, track UPS delivery status, or download print invoices for shop service appointments.
              </p>
              <Link
                href="/orders"
                className="inline-block bg-[#BF8647] text-black font-bold uppercase text-xs px-6 py-2.5 rounded hover:bg-[#D49A50]"
              >
                Track Orders
              </Link>
            </div>

            <div className="bg-[#121212] border border-[#222] p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
                <User className="w-5 h-5 text-[#BF8647]" /> Garage & Vehicle Specs
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Save your motorcycle make, year, and model to get instant fitment recommendations every time you shop.
              </p>
              <Link
                href="/products"
                className="inline-block bg-white text-black font-bold uppercase text-xs px-6 py-2.5 rounded hover:bg-gray-200"
              >
                Shop Fits For My Bike
              </Link>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
