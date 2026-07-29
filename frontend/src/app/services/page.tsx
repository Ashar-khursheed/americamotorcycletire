'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RepairServiceProtocol } from '@/components/RepairServiceProtocol';
import { ServiceProcess } from '@/components/ServiceProcess';
import { SeoHead } from '@/components/SeoHead';

export default function ServicesPage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="services"
        fallbackTitle="Motorcycle Repair & Service Protocol | BMG CYCLES"
        fallbackDescription="Full range of motorcycle services: tire fit & balance, brakes, suspension, alignment, and diagnostics."
      />
      <div>
        <Header />
        <RepairServiceProtocol />
        <ServiceProcess />
      </div>
      <Footer />
    </main>
  );
}
