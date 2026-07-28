'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RepairServiceProtocol } from '@/components/RepairServiceProtocol';
import { ServiceProcess } from '@/components/ServiceProcess';

export default function ServicesPage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />
        <RepairServiceProtocol />
        <ServiceProcess />
      </div>
      <Footer />
    </main>
  );
}
