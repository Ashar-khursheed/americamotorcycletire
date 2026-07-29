'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RefreshCw, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function RefundPolicyPage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="refund-policy"
        fallbackTitle="Refund & Return Policy | BMG CYCLES"
        fallbackDescription="Hassle-free 30-day refund and return policy for motorcycle tires and parts at BMG CYCLES."
      />
      <div>
        <Header />

        {/* Hero Section */}
        <div className="bg-[#070707] border-b border-[#1A1A1A] py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2 font-heading">
              GUARANTEE & RETURNS
            </span>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wide font-heading text-white">
              REFUND & RETURN POLICY
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-4">
              We stand behind every motorcycle tire and service we provide. Hassle-free 30-day return policy.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-gray-300 text-sm leading-relaxed">
          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <RefreshCw className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                1. 30-Day Return Policy
              </h2>
            </div>
            <p>
              Unused and unmounted motorcycle tires or unopened parts in their original packaging can be returned within **30 days** of delivery for a full refund or exchange.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                2. Conditions for Return
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Tires must be unmounted and show no signs of installation, road wear, or bead damage.</li>
              <li>Parts must be in original manufacturer packaging with all labels intact.</li>
              <li>Mounted or driven-on tires are not eligible for standard returns (unless covered by manufacturer warranty defect).</li>
            </ul>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                3. Refund Processing
              </h2>
            </div>
            <p>
              Once your return is received and inspected at our Fremont workshop, your refund will be processed back to your original payment method (Stripe/Card) within **3-5 business days**.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <HelpCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                4. Initiating a Return
              </h2>
            </div>
            <p>
              To initiate a return or exchange, please email or call our team with your order number:
            </p>
            <div className="bg-[#141414] p-4 rounded-lg border border-[#262626] font-mono text-xs text-white">
              BMG CYCLES SUPPORT<br />
              Phone: 408-591-8484 | Email: tennis2016@yahoo.com
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
