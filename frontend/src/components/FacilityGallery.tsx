'use client';

import React from 'react';

export function FacilityGallery() {
  const images = [
    {
      src: '/images/gallery-1.png',
      alt: 'Motocross Akrapovic Exhaust & Dunlop Tire',
      class: 'col-span-1 md:col-span-2 row-span-2 h-[380px]',
    },
    {
      src: '/images/gallery-2.png',
      alt: 'BMW Sport Touring Performance',
      class: 'col-span-1 h-[180px]',
    },
    {
      src: '/images/gallery-3.png',
      alt: 'Off-Road Tire Traction & Rim',
      class: 'col-span-1 h-[180px]',
    },
    {
      src: '/images/gallery-4.png',
      alt: 'BMW R1200GS Adventure Off-Road',
      class: 'col-span-1 h-[180px]',
    },
    {
      src: '/images/gallery-5.png',
      alt: 'Honda Goldwing Highway Cruiser',
      class: 'col-span-1 h-[180px]',
    },
  ];

  return (
    <section className="bg-[#0A0A0A] py-16 lg:py-24 border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
            INSIDE OUR SHOP
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            OUR FACILITY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`rounded-lg overflow-hidden border border-[#222] hover:border-[#BF8647] transition-all group ${img.class}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
