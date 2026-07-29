'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Truck, Clock, PackageCheck, MapPin } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function ShippingPolicyPage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="shipping-policy"
        fallbackTitle="Shipping Policy | BMG CYCLES"
        fallbackDescription="Fast, reliable shipping for high-performance motorcycle tires, parts, and accessories."
      />
      <div>
        <Header />

        {/* Hero Banner */}
        <div className="bg-[#070707] border-b border-[#1A1A1A] py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2 font-heading">
              DISPATCH & FULFILLMENT
            </span>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wide font-heading text-white">
              SHIPPING POLICY
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-4">
              Fast, reliable shipping for high-performance motorcycle tires, parts, and accessories across California and nationwide.
            </p>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-gray-300 text-sm leading-relaxed">
          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <Truck className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                1. Free Shipping Over $99
              </h2>
            </div>
            <p>
              We offer **Free Standard Ground Shipping** on eligible orders over **$99** within the contiguous United States. Orders under $99 incur a flat-rate shipping charge calculated at checkout.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <Clock className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                2. Processing & Dispatch Times
              </h2>
            </div>
            <p>
              In-stock tires and motorcycle components are processed and dispatched within **24 to 48 business hours** from our Fremont, CA distribution hub. Orders placed on weekends or holidays will be processed on the next business day.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <MapPin className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                3. Local In-Store Pickup
              </h2>
            </div>
            <p>
              Local customers in Fremont and the surrounding Bay Area can select **In-Store Pickup** at checkout. Pickup orders are ready within 2 hours during business hours at:
            </p>
            <div className="bg-[#141414] p-4 rounded-lg border border-[#262626] font-mono text-xs text-white">
              BMG CYCLES FREMONT<br />
              3541 YALE WAY FREMONT, CA 94538<br />
              Mon - Sat: 9:00 AM - 6:00 PM
            </div>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <PackageCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                4. Tracking & Delivery Confirmation
              </h2>
            </div>
            <p>
              Once your shipment leaves our facility, you will receive an automated tracking link via email (FedEx, UPS, or USPS) to monitor real-time delivery status.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
