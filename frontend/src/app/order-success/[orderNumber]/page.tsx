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
            <div className="bg-[#121212] border border-[#222] rounded-lg p-6 sm:p-10 space-y-8 print-invoice-card">

              {/* Header for Screen & Print */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#222] pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black uppercase text-white font-heading tracking-wider">
                      BMG CYCLES
                    </h1>
                    <span className="bg-[#BF8647] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded no-print">
                      OFFICIAL INVOICE
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mt-1">
                    America Motorcycle Tire & Fremont Workshop Specialist
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    39575 Cherry St, Fremont, CA 94538 | Phone: (408) 591-8484 | Email: info@bmgcycle.com
                  </p>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-[#222] w-full sm:w-auto">
                  <span className="text-xs text-gray-400 font-bold uppercase block">INVOICE NUMBER</span>
                  <span className="text-2xl font-black text-[#BF8647] font-mono block">{order.order_number}</span>
                  <span className="text-xs text-gray-400 font-semibold block mt-1">
                    Date: {new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs uppercase bg-[#161616] p-6 rounded-lg border border-[#262626]">
                <div className="space-y-1">
                  <span className="text-[#BF8647] font-extrabold block text-[11px] tracking-wider mb-2">BILLED & SHIPPED TO</span>
                  <div><span className="text-gray-400 font-bold">Name: </span><span className="text-white font-bold">{order.customer_name}</span></div>
                  <div><span className="text-gray-400 font-bold">Email: </span><span className="text-white font-bold">{order.customer_email}</span></div>
                  {order.customer_phone && <div><span className="text-gray-400 font-bold">Phone: </span><span className="text-white font-bold">{order.customer_phone}</span></div>}
                  <div className="pt-1"><span className="text-gray-400 font-bold">Address: </span><span className="text-white font-bold">{order.shipping_address}</span></div>
                </div>

                <div className="space-y-1 sm:border-l sm:border-[#262626] sm:pl-6">
                  <span className="text-[#BF8647] font-extrabold block text-[11px] tracking-wider mb-2">PAYMENT & TRANSACTION</span>
                  <div><span className="text-gray-400 font-bold">Payment Method: </span><span className="text-white font-bold">{order.payment_method || 'Credit Card'}</span></div>
                  <div><span className="text-gray-400 font-bold">Payment Status: </span><span className="text-emerald-400 font-bold">PAID</span></div>
                  <div><span className="text-gray-400 font-bold">Transaction Ref: </span><span className="text-white font-mono">{order.transaction_id || 'TXN-BMG' + order.id}</span></div>
                  <div><span className="text-gray-400 font-bold">Fulfillment: </span><span className="text-white font-bold">{order.status || 'PENDING'}</span></div>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <h3 className="text-xs font-extrabold uppercase text-gray-300 tracking-wider mb-3">ITEMIZED ORDER SUMMARY</h3>
                <div className="border border-[#222] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs uppercase">
                    <thead className="bg-[#1C1C1C] text-gray-400 border-b border-[#222]">
                      <tr>
                        <th className="p-3.5">Product Description</th>
                        <th className="p-3.5 text-center">Qty</th>
                        <th className="p-3.5 text-right">Unit Price</th>
                        <th className="p-3.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] text-gray-300">
                      {order.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3.5 font-bold text-white">{item.product_name}</td>
                          <td className="p-3.5 text-center font-mono">{item.quantity}</td>
                          <td className="p-3.5 text-right font-mono">${Number(item.price).toFixed(2)}</td>
                          <td className="p-3.5 text-right font-bold text-[#BF8647] font-mono">
                            ${Number(item.total || (item.price * item.quantity)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col items-end text-xs uppercase space-y-2 pt-4 border-t border-[#222]">
                <div className="flex justify-between w-64 text-gray-400">
                  <span>Subtotal:</span>
                  <span className="text-white font-bold font-mono">${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 text-gray-400">
                  <span>Shipping & Handling:</span>
                  <span className="text-[#BF8647] font-bold font-mono">
                    ${Number(order.shipping_cost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-64 text-sm font-black text-white pt-3 border-t border-[#333]">
                  <span>TOTAL PAID:</span>
                  <span className="text-[#BF8647] font-mono">${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Invoice Footer note */}
              <div className="pt-6 border-t border-[#222] text-[11px] text-gray-400 space-y-1">
                <p className="font-bold text-gray-300 uppercase">THANK YOU FOR YOUR BUSINESS WITH BMG CYCLES!</p>
                <p>For any questions or service scheduling regarding your order, please call (408) 591-8484 or email info@bmgcycle.com.</p>
              </div>

              {/* Action Buttons (Screen Only) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#222] no-print">
                <Link
                  href="/products"
                  className="bg-[#1C1C1C] border border-[#333] hover:border-[#BF8647] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Continue Shopping
                </Link>
                <button
                  onClick={() => window.print()}
                  className="bg-[#BF8647] text-black px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#D49A50] flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Download Invoice
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
