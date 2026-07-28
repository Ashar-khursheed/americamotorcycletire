'use client';

import React from 'react';

export function ServiceProcess() {
  const steps = [
    {
      num: '01',
      title: 'DROP OFF YOUR BIKE',
      desc: 'Bring your motorcycle to our shop or order your fresh tires online for quick fitment scheduling.',
    },
    {
      num: '02',
      desc: 'Our technicians inspect wheel bearings, brake pads, valve stems, and axle alignment.',
      title: 'INSPECTION',
    },
    {
      num: '03',
      title: 'REPAIR & FIT',
      desc: 'Tires are mounted using scratch-free rim guards and precision electronic spin-balanced.',
    },
    {
      num: '04',
      title: 'QUALITY CHECK',
      desc: 'Final test ride and torque check ensuring every fastener meets factory spec.',
    },
  ];

  return (
    <section className="bg-[#0A0A0A] py-16 lg:py-24 border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
            HOW WE WORK
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            OUR SERVICE PROCESS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#121212] border border-[#222] p-6 rounded-lg relative hover:border-[#BF8647] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#BF8647] font-mono font-bold text-lg mb-4">
                {step.num}
              </div>
              <h3 className="text-base font-bold uppercase text-white mb-2 tracking-wider">
                {step.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
