'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export function AboutBmg() {
  return (
    <section className="bg-[#0A0A0A] py-16 lg:py-24 border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column */}
          <div>
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
              ESTABLISHED MOTORCYCLE WORKSHOP
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mb-6">
              BMG CYCLES
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              BMG CYCLES is your trusted local motorcycle tire and repair destination. We combine advanced diagnostic tools, heavy-duty mounting equipment, and decades of riding passion to service everything from Harley-Davidson V-Twins to Japanese inline-fours and European sportbikes.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Every bike that enters our shop receives thorough multi-point safety checks, correct torque specs, and precise tire bead mounting.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#222]">
              <div>
                <div className="text-3xl font-extrabold text-[#BF8647]">15+</div>
                <div className="text-gray-400 text-xs font-semibold uppercase mt-1">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#BF8647]">50K+</div>
                <div className="text-gray-400 text-xs font-semibold uppercase mt-1">Tires Fitted</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#BF8647]">99%</div>
                <div className="text-gray-400 text-xs font-semibold uppercase mt-1">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right Column: Image with floating chat badge */}
          <div className="relative">
            <div className="rounded-lg overflow-hidden border border-[#222] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop"
                alt="BMG Cycles Shop Bike"
                className="w-full h-[400px] object-cover"
              />
            </div>

            {/* Chat Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-[#BF8647] text-black p-5 rounded-lg shadow-xl flex items-center gap-3">
              <MessageSquare className="w-8 h-8 fill-black" />
              <div>
                <div className="font-bold uppercase text-xs">Have Questions?</div>
                <div className="font-extrabold text-sm">Talk To Our Techs</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
