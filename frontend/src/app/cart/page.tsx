'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const shippingCost = subtotal > 99 ? 0 : 15;
  const total = subtotal + shippingCost;

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        <div className="bg-[#121212] border-b border-[#1E1E1E] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
              SHOPPING BAG
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold uppercase text-white">
              YOUR CART
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-[#121212] rounded-lg border border-[#222]">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#BF8647]" />
              <h2 className="text-2xl font-bold uppercase mb-2">Your Cart Is Empty</h2>
              <p className="text-gray-400 text-xs mb-6 uppercase">
                Explore our premium motorcycle tires and gear.
              </p>
              <Link
                href="/products"
                className="bg-[#BF8647] text-black px-8 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#D49A50]"
              >
                Shop Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#141414] border border-[#222] rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
                  >
                    <img
                      src={item.primary_image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&auto=format&fit=crop'}
                      alt={item.name}
                      className="w-24 h-24 object-contain bg-[#1F1F1F] rounded p-2"
                    />

                    <div className="flex-grow text-center sm:text-left">
                      <span className="text-[10px] bg-[#BF8647] text-black font-black uppercase px-2 py-0.5 rounded">
                        {item.brand || 'TIRE'}
                      </span>
                      <h3 className="text-base font-bold uppercase text-white mt-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase mt-1">
                        Price: ${item.price.toFixed(2)}
                      </p>

                      {item.selectedGlobalOptions && item.selectedGlobalOptions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.selectedGlobalOptions.map((opt, idx) => (
                            <div key={idx} className="text-xs text-[#BF8647] font-semibold uppercase">
                              • {opt.groupTitle}: {opt.label} {opt.price > 0 ? `(+$${opt.price.toFixed(2)})` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#333] px-3 py-1.5 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#BF8647]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-400 text-xs mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#141414] border border-[#222] p-6 rounded-lg h-fit space-y-6">
                <h3 className="text-xl font-bold uppercase border-b border-[#222] pb-4">
                  ORDER SUMMARY
                </h3>

                <div className="space-y-3 text-xs uppercase font-semibold text-gray-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-[#BF8647]">
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-[#222]">
                    <span>Total</span>
                    <span className="text-[#BF8647]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-[#BF8647] text-black font-bold uppercase text-xs py-3.5 rounded text-center block hover:bg-[#D49A50] tracking-wider"
                >
                  PROCEED TO CHECKOUT →
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
