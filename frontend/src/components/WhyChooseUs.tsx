'use client';

import React from 'react';

export function WhyChooseUs() {
  const reasons = [
    {
      number: '01',
      title: 'EXPERT WORKFORCE',
      description: 'Certified master technicians with decades of dedicated motorcycle service and tire fitment experience.',
    },
    {
      number: '02',
      title: 'PREMIUM MATERIALS',
      description: 'We only stock official, fresh date-code tires from leading brands like Dunlop, Michelin, and Pirelli.',
    },
    {
      number: '03',
      title: 'RAPID TURNAROUND',
      description: 'Same-day tire mounting, precision electronic balancing, and safety check so you hit the road faster.',
    },
  ];

  return (
    <section className="bg-[#0A0A0A] py-16 lg:py-24 border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
            WHY BMG CYCLES
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            WHY CHOOSE US
          </h2>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#121212] border border-[#222222] p-8 rounded-lg hover:border-[#BF8647] transition-all group"
            >
              <div className="text-4xl font-extrabold text-[#BF8647] mb-4 font-mono">
                {item.number}
              </div>
              <h3 className="text-xl font-bold uppercase text-white mb-3 tracking-wider group-hover:text-[#BF8647] transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
