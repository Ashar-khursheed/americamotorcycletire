'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { placeOrder } from '@/lib/api';
import { ShieldCheck, CreditCard, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('bmg_customer_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setCustomerName(u.name);
        if (u.email) setCustomerEmail(u.email);
        if (u.phone) setCustomerPhone(u.phone);
      }
    } catch (e) {}
  }, []);

  const subtotal = getSubtotal();
  const shippingCost = subtotal > 99 ? 0 : 15;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !shippingAddress || items.length === 0) {
      alert('Please fill in all required fields and ensure your cart is not empty.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      };

      const response = await placeOrder(orderPayload);
      if (response && response.data) {
        clearCart();
        router.push(`/order-success/${response.data.order_number}`);
      }
    } catch (err: any) {
      alert('Error placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        <div className="bg-[#121212] border-b border-[#1E1E1E] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
              SECURE CHECKOUT
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold uppercase text-white">
              FINALISE YOUR ORDER
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">

              {/* Step 1: Customer Info */}
              <div className="bg-[#141414] border border-[#222] p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-bold uppercase text-[#BF8647] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> 1. CUSTOMER INFORMATION
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#1F1F1F] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-[#1F1F1F] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 font-bold uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(510) 000-0000"
                      className="w-full bg-[#1F1F1F] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="bg-[#141414] border border-[#222] p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-bold uppercase text-[#BF8647] flex items-center gap-2">
                  <Truck className="w-5 h-5" /> 2. SHIPPING ADDRESS
                </h3>
                <div className="text-xs">
                  <label className="block text-gray-400 font-bold uppercase mb-1">Street Address & City *</label>
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="39575 Cherry St, Fremont, CA 94538"
                    className="w-full bg-[#1F1F1F] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#BF8647]"
                  />
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-[#141414] border border-[#222] p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-bold uppercase text-[#BF8647] flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> 3. PAYMENT METHOD
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase">
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded border cursor-pointer text-center flex flex-col items-center gap-2 ${paymentMethod === 'card'
                        ? 'border-[#BF8647] bg-[#BF8647]/10 text-white'
                        : 'border-[#333] bg-[#1F1F1F] text-gray-400'
                      }`}
                  >
                    <CreditCard className="w-6 h-6 text-[#BF8647]" />
                    <span>Credit / Debit Card</span>
                  </label>
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded border cursor-pointer text-center flex flex-col items-center gap-2 ${paymentMethod === 'cod'
                        ? 'border-[#BF8647] bg-[#BF8647]/10 text-white'
                        : 'border-[#333] bg-[#1F1F1F] text-gray-400'
                      }`}
                  >
                    <Truck className="w-6 h-6 text-[#BF8647]" />
                    <span>Pay On Pickup / COD</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Sidebar Summary */}
            <div className="bg-[#141414] border border-[#222] p-6 rounded-lg h-fit space-y-6">
              <h3 className="text-xl font-bold uppercase border-b border-[#222] pb-4">
                ORDER REVIEW
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-300">
                    <span className="truncate max-w-[180px]">{item.name} x{item.quantity}</span>
                    <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#222] space-y-2 text-xs uppercase font-semibold">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-[#BF8647]">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-[#222]">
                  <span>Total Due</span>
                  <span className="text-[#BF8647]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#BF8647] text-black font-bold uppercase text-xs py-4 rounded text-center block hover:bg-[#D49A50] tracking-wider transition-colors disabled:opacity-50"
              >
                {submitting ? 'PROCESSING ORDER...' : 'PLACE ORDER NOW'}
              </button>
            </div>

          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
