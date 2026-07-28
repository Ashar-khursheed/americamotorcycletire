'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchOrderById } from '@/lib/api';
import Link from 'next/link';
import { CheckCircle2, Printer, ArrowLeft } from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderById(orderNumber)
        .then((data) => setOrder(data))
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-16">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Fetching order invoice...</div>
          ) : !order ? (
            <div className="text-center py-20 bg-[#121212] rounded-lg border border-[#222]">
              <h2 className="text-xl font-bold uppercase mb-2">Order Confirmed</h2>
              <p className="text-gray-400 text-xs uppercase mb-6">
                Your order #{orderNumber} has been received.
              </p>
              <Link href="/" className="bg-[#BF8647] text-black px-6 py-2.5 rounded text-xs font-bold uppercase">
                Return Home
              </Link>
            </div>
          ) : (
            <div className="bg-[#121212] border border-[#222] rounded-lg p-8 space-y-8">

              {/* Success Badge */}
              <div className="text-center border-b border-[#222] pb-8">
                <CheckCircle2 className="w-16 h-16 text-[#BF8647] mx-auto mb-4" />
                <h1 className="text-3xl font-extrabold uppercase text-white mb-2">
                  ORDER PLACED SUCCESSFULLY!
                </h1>
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  Order Reference Number: <span className="text-[#BF8647] font-bold">{order.order_number}</span>
                </p>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs uppercase bg-[#161616] p-6 rounded border border-[#262626]">
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Customer Name</span>
                  <span className="text-white font-bold">{order.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Email Address</span>
                  <span className="text-white font-bold">{order.customer_email}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Shipping Address</span>
                  <span className="text-white font-bold">{order.shipping_address}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Order Status</span>
                  <span className="bg-[#BF8647] text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">
                    {order.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-sm font-bold uppercase text-white mb-4">ITEMS ORDERED</h3>
                <div className="border border-[#222] rounded overflow-hidden">
                  <table className="w-full text-left text-xs uppercase">
                    <thead className="bg-[#1C1C1C] text-gray-400">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] text-gray-300">
                      {order.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3 font-bold text-white">{item.product_name}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3 text-right">${Number(item.price).toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-[#BF8647]">
                            ${Number(item.total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex flex-col items-end text-xs uppercase space-y-2 pt-4 border-t border-[#222]">
                <div className="flex justify-between w-48 text-gray-400">
                  <span>Subtotal:</span>
                  <span className="text-white font-bold">${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-gray-400">
                  <span>Shipping:</span>
                  <span className="text-[#BF8647] font-bold">
                    ${Number(order.shipping_cost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-48 text-sm font-bold text-white pt-2 border-t border-[#333]">
                  <span>Total Paid:</span>
                  <span className="text-[#BF8647]">${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#222]">
                <Link
                  href="/products"
                  className="bg-[#1C1C1C] border border-[#333] hover:border-[#BF8647] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Continue Shopping
                </Link>
                <button
                  onClick={() => window.print()}
                  className="bg-[#BF8647] text-black px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#D49A50] flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
