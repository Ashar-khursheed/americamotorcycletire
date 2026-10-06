'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Phone, ShieldCheck, Wrench } from 'lucide-react';

export function SpecialPromoStrip() {
  return (
    <section className="bg-gradient-to-r from-[#16120D] via-[#2B1E10] to-[#16120D] border-y-2 border-[#BF8647] py-6 sm:py-7 relative overflow-hidden shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#BF8647]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 text-center lg:text-left">
          
          {/* Left: Promo Icon & Text */}
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-3xl">
            <div className="w-12 h-12 rounded-xl bg-[#BF8647] text-black flex items-center justify-center shrink-0 shadow-lg shadow-[#BF8647]/30">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-1">
                <span className="bg-[#BF8647] text-black text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded font-heading">
                  EXCLUSIVE DEAL
                </span>
                <span className="text-[#BF8647] font-black text-sm sm:text-base uppercase tracking-wider font-heading">
                  SPECIAL PROMO
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-heading">
                FREE MOUNT & BALANCED — <span className="text-[#BF8647]">BUY FROM US!</span>
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm font-medium mt-1">
                Purchase your motorcycle tires from BMG CYCLES and receive complimentary professional in-house mounting and precision computerized spin balancing.
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/products"
              className="bg-[#BF8647] text-black px-6 py-3 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-[#D49A50] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#BF8647]/20 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>SHOP TIRES & CLAIM</span>
            </Link>
            <a
              href="tel:4085918484"
              className="border border-[#BF8647]/60 text-white bg-black/40 hover:bg-black hover:border-[#BF8647] px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#BF8647]" />
              <span>408-591-8484</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
