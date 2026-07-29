'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SeoHead } from '@/components/SeoHead';

export default function AboutPage() {
  return (
    <main className="bg-[#0D0D0D] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="about"
        fallbackTitle="About BMG CYCLES | Motorcycle Repair & Tire Specialists"
        fallbackDescription="Learn about BMG CYCLES in Fremont CA. Over 15 years of industry experience in motorcycle tires and service."
      />
      <div>
        <Header />

        {/* Hero Section */}
        <div className="relative bg-[#070707] py-24 sm:py-32 border-b border-[#1A1A1A] overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1600&auto=format&fit=crop"
              alt="BMG Cycles Shop"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-[#0D0D0D]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black uppercase font-heading tracking-wider text-white">
              ABOUT US
            </h1>
          </div>
        </div>

        {/* Section 1: BMG CYCLES Story */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase font-heading text-white tracking-wide">
                BMG CYCLES
              </h2>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
                <p>
                  At BMG CYCLES, motorcycles aren't just machines—they're a way of life. Based in Fremont, California, we have built our reputation on providing premium motorcycle tires, expert installation, precision balancing, and professional repair services for riders throughout Northern California.
                </p>
                <p>
                  With over 15 years of industry experience, our certified technicians specialize in everything from routine tire replacements to advanced diagnostics and mechanical repairs. We proudly stock leading tire brands including Michelin, Dunlop, Pirelli, Metzeler, Bridgestone, and Continental, ensuring every rider finds the perfect fit for their motorcycle and riding style.
                </p>
                <p>
                  Our commitment is simple: deliver exceptional service, quality workmanship, and reliable performance that keeps riders safe, confident, and ready for every mile ahead. Whether you're a daily commuter, weekend cruiser, adventure rider, or track enthusiast, we treat every motorcycle with the same level of care and precision as if it were our own.
                </p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#222222] shadow-2xl shadow-[#BF8647]/10 group">
              <img
                src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop"
                alt="BMG Cycles Shop Interior"
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Section 2: Mission & Vision */}
        <div className="bg-[#080808] border-t border-b border-[#1A1A1A] py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="relative rounded-2xl overflow-hidden border border-[#222222] shadow-2xl shadow-[#BF8647]/10 order-2 lg:order-1 group">
                <img
                  src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&auto=format&fit=crop"
                  alt="Motorcycle Tires Grid"
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              <div className="space-y-8 order-1 lg:order-2">
                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-extrabold uppercase font-heading text-white tracking-wide">
                    OUR MISSION
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    Our mission is to provide riders with the highest level of motorcycle tire and repair services through expert craftsmanship, premium products, and outstanding customer care. We are dedicated to enhancing rider safety, maximizing motorcycle performance, and delivering dependable solutions that keep our customers on the road with confidence.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#1C1C1C]">
                  <h3 className="text-2xl sm:text-3xl font-extrabold uppercase font-heading text-white tracking-wide">
                    OUR VISION
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    Our vision is to become the most trusted motorcycle tire and service destination in California by setting the standard for quality, innovation, and customer satisfaction. We strive to build lasting relationships with riders, support the motorcycle community, and continue evolving our services to meet the demands of modern motorcycling for generations to come.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
