'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileText, Shield, Wrench, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        {/* Hero Section */}
        <div className="bg-[#070707] border-b border-[#1A1A1A] py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2 font-heading">
              TERMS & CONDITIONS
            </span>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wide font-heading text-white">
              TERMS OF SERVICE
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-4">
              Please read these terms and conditions carefully before using our storefront or scheduling workshop services.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-gray-300 text-sm leading-relaxed">
          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                1. Acceptance of Terms
              </h2>
            </div>
            <p>
              By accessing BMG CYCLES website or booking motorcycle tire mounting, balancing, or repair services, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <Wrench className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                2. Fitment & Technical Compatibility
              </h2>
            </div>
            <p>
              While BMG CYCLES provides automated vehicle fitment matching for tires and wheels based on manufacturer guidelines, buyers remain responsible for confirming rim size, clearance, and speed rating suitability for custom motorcycle modifications.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <Shield className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                3. Workshop Service Appointments
              </h2>
            </div>
            <p>
              Appointments booked online or via phone require confirmation. Vehicles dropped off for tire installation or repair must be picked up within 24 hours of service completion notification unless prior arrangements have been made.
            </p>
          </section>

          <section className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#BF8647]">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase font-heading text-white">
                4. Limitation of Liability
              </h2>
            </div>
            <p>
              BMG CYCLES shall not be liable for indirect, incidental, or consequential damages resulting from improper third-party tire mounting or unauthorized vehicle alterations performed outside our certified Fremont facility.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
