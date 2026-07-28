'use client';

import React from 'react';
import { Star } from 'lucide-react';

export function Testimonials() {
  const reviews = [
    {
      name: 'MARCUS V.',
      bike: 'Harley Road Glide',
      text: 'BMG CYCLES replaced my Dunlop rear tire in under an hour. Great prices and true motorcycle experts.',
      stars: 5,
      avatarBg: 'bg-red-600',
    },
    {
      name: 'DANIEL K.',
      bike: 'Yamaha YZF-R1',
      text: 'Super precise balancing. Zero high-speed wobble after fitting Michelin Power 5s. 10/10 shop!',
      stars: 5,
      avatarBg: 'bg-blue-600',
    },
    {
      name: 'ALEX R.',
      bike: 'BMW R1250 GS',
      text: 'Fast appointment, excellent customer service and top quality work. Will always come here for tires.',
      stars: 5,
      avatarBg: 'bg-gray-600',
    },
  ];

  return (
    <section className="bg-[#0A0A0A] py-16 lg:py-24 border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
            RIDER REVIEWS
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            WHAT OUR CUSTOMERS SAY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#121212] border border-[#222] p-6 rounded-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#BF8647] mb-4">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#BF8647]" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed mb-6">
                  "{rev.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#222]">
                <div className={`w-9 h-9 rounded-full ${rev.avatarBg} flex items-center justify-center text-white font-bold text-xs`}>
                  {rev.name[0]}
                </div>
                <div>
                  <div className="text-white font-bold text-xs uppercase tracking-wider">{rev.name}</div>
                  <div className="text-gray-500 text-[11px] uppercase">{rev.bike}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
