'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function RepairServiceProtocol() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const services = [
    {
      title: 'TIRE FIT & BALANCE',
      description: 'Precision mounting and digital wheel balancing to eliminate vibrations and ensure maximum tire lifespan on road or track.',
    },
    {
      title: 'BRAKES & SUSPENSION',
      description: 'Full brake rotor replacement, pad installation, fork seal rebuilding, and custom suspension sag setup for optimal handling.',
    },
    {
      title: 'CHAIN & SPROCKETS',
      description: 'Heavy duty DID/RK chain installation, sprocket ratio optimization, and laser alignment for smooth power delivery.',
    },
    {
      title: 'WHEEL ALIGNMENT & TIRE',
      description: 'Laser guided front and rear axle alignment, rim truing, and tire bead sealing.',
    },
    {
      title: 'ENGINE DIAGNOSTICS',
      description: 'Full computerized ECU scanning, throttle body synchronization, and performance tuning.',
    },
  ];

  return (
    <section className="bg-[#B87B35] text-black py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Content & Accordion */}
          <div>
            <span className="text-black/80 font-bold text-xs uppercase tracking-widest block mb-2">
              SERVICE & REPAIR PROTOCOL
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-black mb-6">
              REPAIR & SERVICE <br /> PROTOCOL
            </h2>
            <p className="text-black/90 text-sm font-medium mb-8">
              From sport bikes to heavy cruisers, our master technicians follow strict manufacturer specifications to ensure safe, reliable, and peak performance riding.
            </p>

            {/* Accordion */}
            <div className="space-y-3">
              {services.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-black/20 pb-1"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left font-extrabold text-sm sm:text-base uppercase tracking-wider text-black py-3 hover:opacity-80 transition-opacity"
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-black transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : 'rotate-0'
                        }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openIndex === idx ? 'grid-rows-[1fr] opacity-100 pb-3' : 'grid-rows-[0fr] opacity-0'
                      }`}
                  >
                    <div className="overflow-hidden text-black/90 text-xs sm:text-sm font-medium leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-black/20 group">
            <img
              src="/images/cnt.webp"
              alt="Motorcycle Service & Repair Specialist"
              className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
