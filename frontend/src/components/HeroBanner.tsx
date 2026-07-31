'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bike, Filter } from 'lucide-react';
import { api } from '@/lib/api';

export function HeroBanner() {
  const router = useRouter();
  const [years, setYears] = useState<string[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedYear) params.year = selectedYear;
    if (selectedMake) params.make = selectedMake;
    if (selectedModel) params.model = selectedModel;

    api.get('/fitments/options', { params })
      .then((res) => {
        if (res.data) {
          const newYears = res.data.years || [];
          const newMakes = res.data.makes || [];
          const newModels = res.data.models || [];

          setYears(newYears);
          setMakes(newMakes);
          setModels(newModels);

          if (selectedMake && !newMakes.includes(selectedMake)) {
            setSelectedMake('');
          }
          if (selectedModel && !newModels.includes(selectedModel)) {
            setSelectedModel('');
          }
        }
      })
      .catch(() => { });
  }, [selectedYear, selectedMake, selectedModel]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedYear) query.set('year', selectedYear);
    if (selectedMake) query.set('make', selectedMake);
    if (selectedModel) query.set('model', selectedModel);

    router.push(`/products?${query.toString()}`);
  };

  return (
    <section className="relative bg-[#0A0A0A] overflow-hidden py-16 lg:py-24 border-b border-[#1E1E1E]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-60 mix-blend-luminosity"
        style={{
          backgroundImage: `url('/images/hero-motorcycle.png')`,
        }}
      />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column Text */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-0.5 bg-[#BF8647]" />
              <span className="text-[#BF8647] text-xs font-semibold tracking-widest uppercase">
                REPAIR & SERVICE SPECIALISTS
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white uppercase mb-4 leading-tight">
              MOTORCYCLE <br />
              <span className="text-[#BF8647]">TIRES & PARTS</span>
            </h1>

            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-xl">
              Premier motorcycle repair, maintenance, and tire service center in Fremont, CA. Find exact fitting tires, wheels, and accessories for your specific bike model.
            </p>

            <div className="flex flex-wrap items-center gap-4 uppercase font-semibold text-xs">
              <Link
                href="/products"
                className="bg-[#BF8647] text-black px-8 py-3.5 rounded hover:bg-[#D49A50] transition-colors font-bold tracking-wider"
              >
                BROWSE CATALOGUE
              </Link>
              <Link
                href="/services"
                className="border-2 border-white/30 text-white px-8 py-3.5 rounded hover:border-[#BF8647] hover:text-[#BF8647] transition-colors tracking-wider"
              >
                OUR SERVICES
              </Link>
            </div>
          </div>

          {/* Right Column: Motorcycle Fitment Finder Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#121212]/95 border-2 border-[#BF8647]/60 rounded-xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4 border-b border-[#222] pb-3">
                <Bike className="w-6 h-6 text-[#BF8647]" />
                <div>
                  <h3 className="font-extrabold text-white text-base uppercase tracking-wider">
                    BIKE FITMENT FINDER
                  </h3>
                  <p className="text-gray-400 text-xs">Select your motorcycle to filter exact fit parts</p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">

                {/* Year Select */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                    1. Select Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded px-3 py-2.5 text-xs font-semibold uppercase focus:border-[#BF8647] focus:outline-none"
                  >
                    <option value="">ALL YEARS</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Make Select */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                    2. Select Make
                  </label>
                  <select
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded px-3 py-2.5 text-xs font-semibold uppercase focus:border-[#BF8647] focus:outline-none"
                  >
                    <option value="">ALL MAKES (Harley, Honda, etc.)</option>
                    {makes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Model Select */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                    3. Select Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded px-3 py-2.5 text-xs font-semibold uppercase focus:border-[#BF8647] focus:outline-none"
                  >
                    <option value="">ALL MODELS (Road Glide, CBR, etc.)</option>
                    {models.map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#BF8647] text-black font-extrabold uppercase text-xs py-3.5 rounded hover:bg-[#D49A50] transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <Search className="w-4 h-4" /> FIND TIRES & PARTS FOR MY BIKE
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
