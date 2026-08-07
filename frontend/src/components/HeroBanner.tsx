'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bike, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';

export function HeroBanner() {
  const router = useRouter();

  const [types, setTypes] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // 1. Initial fetch for Vehicle Types
  useEffect(() => {
    api
      .get('/fitments/options')
      .then((res) => {
        if (res.data) {
          setTypes(res.data.types || []);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Type changed -> Fetch Years
  useEffect(() => {
    setSelectedYear('');
    setSelectedMake('');
    setSelectedModel('');
    setYears([]);
    setMakes([]);
    setModels([]);

    if (selectedType) {
      setLoadingYears(true);
      api
        .get('/fitments/options', { params: { type: selectedType } })
        .then((res) => {
          if (res.data) setYears(res.data.years || []);
        })
        .catch(() => {})
        .finally(() => setLoadingYears(false));
    }
  }, [selectedType]);

  // 3. Year changed -> Fetch Makes
  useEffect(() => {
    setSelectedMake('');
    setSelectedModel('');
    setMakes([]);
    setModels([]);

    if (selectedYear) {
      setLoadingMakes(true);
      const params: Record<string, string> = { year: selectedYear };
      if (selectedType) params.type = selectedType;

      api
        .get('/fitments/options', { params })
        .then((res) => {
          if (res.data) setMakes(res.data.makes || []);
        })
        .catch(() => {})
        .finally(() => setLoadingMakes(false));
    }
  }, [selectedType, selectedYear]);

  // 4. Make changed -> Fetch Models
  useEffect(() => {
    setSelectedModel('');
    setModels([]);

    if (selectedYear && selectedMake) {
      setLoadingModels(true);
      const params: Record<string, string> = { year: selectedYear, make: selectedMake };
      if (selectedType) params.type = selectedType;

      api
        .get('/fitments/options', { params })
        .then((res) => {
          if (res.data) setModels(res.data.models || []);
        })
        .catch(() => {})
        .finally(() => setLoadingModels(false));
    }
  }, [selectedType, selectedYear, selectedMake]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedYear || !selectedMake || !selectedModel) return;

    const query = new URLSearchParams();
    if (selectedType) query.set('vehicle_type', selectedType);
    query.set('year', selectedYear);
    query.set('make', selectedMake);
    query.set('model', selectedModel);

    router.push(`/products?${query.toString()}`);
  };

  const isFormComplete = Boolean(selectedType && selectedYear && selectedMake && selectedModel);

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
              <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-3">
                <div className="flex items-center gap-3">
                  <Bike className="w-6 h-6 text-[#BF8647]" />
                  <div>
                    <h3 className="font-extrabold text-white text-base uppercase tracking-wider">
                      SHOP YOUR RIDE
                    </h3>
                    <p className="text-gray-400 text-xs">Select steps in sequence to unlock fitment</p>
                  </div>
                </div>
                {(selectedType || selectedYear || selectedMake || selectedModel) && (
                  <button
                    onClick={() => {
                      setSelectedType('');
                      setSelectedYear('');
                      setSelectedMake('');
                      setSelectedModel('');
                    }}
                    className="text-[11px] text-gray-400 hover:text-[#BF8647] flex items-center gap-1 font-bold lowercase"
                  >
                    <RotateCcw className="w-3 h-3" /> reset
                  </button>
                )}
              </div>

              <form onSubmit={handleSearch} className="space-y-3.5">
                {/* STEP 1: Select Type */}
                <div>
                  <label className="flex items-center justify-between text-[11px] font-bold text-gray-300 uppercase mb-1">
                    <span>1. SELECT BIKE TYPE</span>
                    {selectedType && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded px-3 py-2.5 text-xs font-semibold uppercase focus:border-[#BF8647] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- SELECT TYPE --</option>
                    {types.length > 0
                      ? types.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))
                      : ['Street Bike', 'Dirt Bike', 'UTV/ATV'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                  </select>
                </div>

                {/* STEP 2: Select Year */}
                <div>
                  <label
                    className={`flex items-center justify-between text-[11px] font-bold uppercase mb-1 ${
                      selectedType ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <span>2. SELECT YEAR</span>
                    {selectedYear && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    disabled={!selectedType || loadingYears}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded px-3 py-2.5 text-xs font-semibold uppercase focus:border-[#BF8647] focus:outline-none disabled:opacity-40 disabled:bg-[#141414] disabled:border-[#222] disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">
                      {!selectedType
                        ? 'SELECT TYPE FIRST'
                        : loadingYears
                        ? 'LOADING YEARS...'
                        : '-- SELECT YEAR --'}
                    </option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STEP 3: Select Make */}
                <div>
                  <label
                    className={`flex items-center justify-between text-[11px] font-bold uppercase mb-1 ${
                      selectedYear ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <span>3. SELECT MAKE</span>
                    {selectedMake && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <select
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                    disabled={!selectedYear || loadingMakes}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded px-3 py-2.5 text-xs font-semibold uppercase focus:border-[#BF8647] focus:outline-none disabled:opacity-40 disabled:bg-[#141414] disabled:border-[#222] disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">
                      {!selectedYear
                        ? 'SELECT YEAR FIRST'
                        : loadingMakes
                        ? 'LOADING MAKES...'
                        : '-- SELECT MAKE --'}
                    </option>
                    {makes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STEP 4: Select Model */}
                <div>
                  <label
                    className={`flex items-center justify-between text-[11px] font-bold uppercase mb-1 ${
                      selectedMake ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <span>4. SELECT MODEL</span>
                    {selectedModel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!selectedMake || loadingModels}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded px-3 py-2.5 text-xs font-semibold uppercase focus:border-[#BF8647] focus:outline-none disabled:opacity-40 disabled:bg-[#141414] disabled:border-[#222] disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">
                      {!selectedMake
                        ? 'SELECT MAKE FIRST'
                        : loadingModels
                        ? 'LOADING MODELS...'
                        : '-- SELECT MODEL --'}
                    </option>
                    {models.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!isFormComplete}
                  className={`w-full font-extrabold uppercase text-xs py-3.5 rounded transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer ${
                    isFormComplete
                      ? 'bg-[#BF8647] text-black hover:bg-[#D49A50] shadow-lg shadow-[#BF8647]/30'
                      : 'bg-[#222] text-gray-500 border border-[#333] cursor-not-allowed opacity-60'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>
                    {isFormComplete
                      ? 'FIND TIRES & PARTS FOR MY BIKE'
                      : 'COMPLETE ALL STEPS TO SEARCH'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
