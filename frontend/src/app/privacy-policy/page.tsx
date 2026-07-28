'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        {/* Hero Section */}
        <div className="bg-[#070707] border-b border-[#1A1A1A] py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2 font-heading">
              LEGAL & TRANSPARENCY
            </span>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wide font-heading text-white">
              PRIVACY POLICY
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-4">
              At BMG CYCLES, your privacy and data security are our top priorities. Learn how we collect, protect, and handle your information.
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-gray-300 text-sm leading-relaxed">
          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <Eye className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                1. Information We Collect
              </h2>
            </div>
            <p>
              When you visit BMG CYCLES, purchase motorcycle tires, or schedule a service appointment, we collect essential information required to process your requests:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong>Contact Details:</strong> Full name, email address, phone number, and shipping/billing address.</li>
              <li><strong>Vehicle Specifications:</strong> Motorcycle year, make, model, and tire size specs for fitment verification.</li>
              <li><strong>Payment Information:</strong> Secure payment processing tokens processed directly via Stripe or PayPal (we do not store raw card numbers).</li>
            </ul>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                2. How We Protect Your Data
              </h2>
            </div>
            <p>
              We implement industry-standard 256-bit SSL encryption across our entire application and storefront. Access to your transaction and service record data is restricted to authorized BMG CYCLES technicians and customer support personnel.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                3. Third-Party Services
              </h2>
            </div>
            <p>
              BMG CYCLES will never sell, rent, or trade your personal information to third parties. We share data only with essential operational service providers such as freight shipping carriers (FedEx, UPS) and payment gateways (Stripe) to deliver your orders.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                4. Contact Our Privacy Team
              </h2>
            </div>
            <p>
              If you have any questions or requests regarding your personal data, please contact us directly:
            </p>
            <div className="bg-[#141414] p-4 rounded-lg border border-[#262626] font-mono text-xs text-white">
              BMG CYCLES FREMONT<br />
              3541 YALE WAY FREMONT, CA 94538<br />
              Email: tennis2016@yahoo.com | Phone: 408-591-8484
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
