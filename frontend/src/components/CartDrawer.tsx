'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const shippingCost = subtotal > 99 ? 0 : 15;
  const total = subtotal + shippingCost;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F0F0F] text-white shadow-2xl border-l border-[#222] flex flex-col justify-between">

          {/* Header */}
          <div className="p-6 border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#BF8647]" />
              <h2 className="text-xl font-bold uppercase tracking-wider">YOUR CART ({items.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-6 overflow-y-auto flex-grow space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-40 text-[#BF8647]" />
                <p className="text-sm font-semibold uppercase">Your cart is currently empty.</p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-[#BF8647] text-black px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#D49A50]"
                >
                  Shop Motorcycle Tires
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#161616] border border-[#262626] rounded-lg p-4 flex gap-4 items-center justify-between"
                >
                  <img
                    src={item.primary_image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&auto=format&fit=crop'}
                    alt={item.name}
                    className="w-16 h-16 object-contain bg-[#1F1F1F] rounded p-1"
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold uppercase line-clamp-1 text-white">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 uppercase mt-0.5">
                      ${item.price.toFixed(2)} each
                    </p>

                    {item.selectedGlobalOptions && item.selectedGlobalOptions.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedGlobalOptions.map((opt, idx) => (
                          <div key={idx} className="text-[10px] text-[#BF8647] font-semibold uppercase">
                            • {opt.groupTitle}: {opt.label} {opt.price > 0 ? `(+$${opt.price.toFixed(2)})` : ''}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-[#222] border border-[#333] flex items-center justify-center text-xs hover:bg-[#BF8647] hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-[#222] border border-[#333] flex items-center justify-center text-xs hover:bg-[#BF8647] hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <span className="text-sm font-bold text-[#BF8647]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors mt-2"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#222] bg-[#121212] space-y-4">
              <div className="space-y-2 text-xs uppercase font-semibold">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-[#BF8647] font-bold">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#222]">
                  <span>Total</span>
                  <span className="text-[#BF8647]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 uppercase text-xs font-bold">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="bg-[#1E1E1E] text-white py-3 rounded text-center border border-[#333] hover:border-[#BF8647]"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="bg-[#BF8647] text-black py-3 rounded text-center hover:bg-[#D49A50] flex items-center justify-center gap-1"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
