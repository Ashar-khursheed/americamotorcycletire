'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchOrderById } from '@/lib/api';
import Link from 'next/link';
import { Search, Package, Clock, ShieldCheck } from 'lucide-react';

export default function OrderLookupPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    fetchOrderById(query)
      .then((res) => setOrder(res))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        <div className="bg-[#121212] border-b border-[#1E1E1E] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
              CUSTOMER PORTAL
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold uppercase text-white">
              ORDER LOOKUP & TRACKING
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">

          <form onSubmit={handleSearch} className="bg-[#141414] border border-[#222] p-6 rounded-lg space-y-4">
            <label className="block text-xs font-bold uppercase text-gray-400">
              Enter Order Number (e.g. BMG-XXXXXX)
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="BMG-XXXXXX"
                className="flex-grow bg-[#1F1F1F] border border-[#333] rounded px-4 py-3 text-xs text-white uppercase focus:outline-none focus:border-[#BF8647]"
              />
              <button
                type="submit"
                className="bg-[#BF8647] text-black px-8 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#D49A50]"
              >
                Track Order
              </button>
            </div>
          </form>

          {loading && <div className="text-center py-10 text-gray-400">Searching order records...</div>}

          {searched && !loading && !order && (
            <div className="text-center py-12 bg-[#121212] border border-[#222] rounded-lg text-gray-400">
              No order found matching "{query}". Please check the Order Number and try again.
            </div>
          )}

          {order && (
            <div className="bg-[#121212] border border-[#222] rounded-lg p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-[#222] pb-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase block">Order Number</span>
                  <span className="text-xl font-bold text-[#BF8647]">{order.order_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase block">Status</span>
                  <span className="bg-[#BF8647] text-black font-black text-xs px-3 py-1 rounded uppercase">
                    {order.status || 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs uppercase bg-[#161616] p-4 rounded">
                <div>
                  <span className="text-gray-400 font-bold">Customer:</span> {order.customer_name}
                </div>
                <div>
                  <span className="text-gray-400 font-bold">Total:</span> ${Number(order.total_amount).toFixed(2)}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-white mb-2">Order Items</h4>
                <ul className="divide-y divide-[#222] text-xs uppercase">
                  {order.items?.map((item: any) => (
                    <li key={item.id} className="py-2 flex justify-between">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span className="text-[#BF8647] font-bold">${Number(item.total).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}
