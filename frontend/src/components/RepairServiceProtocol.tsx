'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function RepairServiceProtocol() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const services = [
    {
      title: 'Tires',
      description: 'Precision mounting and digital wheel balancing to eliminate vibrations and ensure maximum tire lifespan on road or track.',
    },
    {
      title: 'Service',
      description: 'Complete tune-ups covering oil change, filter replacement, and multi-point inspection to keep your bike running at peak condition.',
    },
    {
      title: 'Brakes',
      description: 'Full brake pad and rotor replacement with fluid bleeding to ensure sharp, reliable stopping power in every ride.',
    },
    {
      title: 'Clutch',
      description: 'Clutch plate inspection, replacement, and cable/hydraulic adjustment for smooth, responsive gear engagement.',
    },
    {
      title: 'Coolant Flush',
      description: 'Complete radiator and coolant system flush to prevent overheating and protect your engine year-round.',
    },
    {
      title: 'Carburetor Rebuild',
      description: 'Full carburetor teardown, cleaning, and rejetting to restore smooth throttle response and fuel efficiency.',
    },
    {
      title: 'Chain & Sprocket Replacement',
      description: 'Heavy-duty chain and sprocket replacement with laser alignment for smooth, efficient power delivery.',
    },
    {
      title: 'Electrical Repair',
      description: 'Diagnosis and repair of wiring, battery, ignition, and charging system issues to keep your bike reliably powered.',
    },
    {
      title: 'Front Fork Rebuild',
      description: 'Fork seal replacement and oil rebuild to restore proper suspension damping and a smoother ride.',
    },
    {
      title: 'Transmission Rebuild',
      description: 'Complete gearbox inspection and rebuild to fix slipping, grinding, or hard-shifting issues.',
    },
    {
      title: 'Handlebars',
      description: 'Handlebar replacement, repositioning, and grip installation tailored to your riding comfort and style.',
    },
    {
      title: 'Audio Installation',
      description: 'Custom motorcycle audio system installation with weatherproof speakers wired cleanly into your bike.',
    },
    {
      title: 'Headlight & Tail Light Installation',
      description: 'Upgraded headlight and tail light installation for improved visibility and a customized look.',
    },
    {
      title: 'CUSTOM INSTALLATIONS',
      description: 'We also do custom installations on any bike.',
    },
  ];

  
  return (
    <section className="bg-[#B87B35] text-black py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Top: Heading + description */}
          <div className="mb-10 max-w-3xl">
            <span className="text-black/80 font-bold text-xs uppercase tracking-widest block mb-2">
              SERVICE & REPAIR PROTOCOL
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-black mb-6">
              REPAIR & SERVICE PROTOCOL
            </h2>
            <p className="text-black/90 text-sm font-medium">
              From sport bikes to heavy cruisers, our master technicians follow strict manufacturer specifications to ensure safe, reliable, and peak performance riding.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Accordion in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {services.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-black/20 pb-1 h-fit"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left font-extrabold text-sm sm:text-base uppercase tracking-wider text-black py-3 hover:opacity-80 transition-opacity"
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-black transition-transform duration-300 flex-shrink-0 ml-2 ${openIndex === idx ? 'rotate-180' : 'rotate-0'
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

            {/* Right Column: Image */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-black/20 group h-fit">
              <img
                src="/images/cnt.webp"
                alt="Motorcycle Service & Repair Specialist"
                className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}