'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="bg-[#B87B35] text-black py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-2 text-black">
            NEED NEW TIRES OR REPAIR?
          </h2>
          <p className="text-black/90 text-sm font-medium">
            Call us today to schedule your tire fitment, suspension tuning, or repair service.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 uppercase font-bold text-xs">
          <a
            href="tel:4085918484"
            className="bg-white text-black px-6 py-3 rounded hover:bg-black hover:text-white transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>CALL 408-591-8484</span>
          </a>
          <Link
            href="/contact"
            className="border-2 border-black/40 text-black px-6 py-3 rounded hover:bg-black hover:text-white hover:border-black transition-colors flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>VISIT OUR SHOP</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
