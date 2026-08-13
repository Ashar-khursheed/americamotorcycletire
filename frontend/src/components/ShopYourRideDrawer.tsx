'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Bike, ChevronRight, CheckCircle2, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ShopYourRideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SavedVehicle {
  id: string;
  type?: string;
  year: string;
  make: string;
  model: string;
}

export function ShopYourRideDrawer({ isOpen, onClose }: ShopYourRideDrawerProps) {
  const router = useRouter();

  // Selected values in sequence
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  // Options populated step-by-step from backend
  const [typesList, setTypesList] = useState<string[]>([]);
  const [yearsList, setYearsList] = useState<string[]>([]);
  const [makesList, setMakesList] = useState<string[]>([]);
  const [modelsList, setModelsList] = useState<string[]>([]);

  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [recentVehicles, setRecentVehicles] = useState<SavedVehicle[]>([]);

  // Load Recent Vehicles from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bmg_recent_vehicles');
      if (stored) {
        setRecentVehicles(JSON.parse(stored));
      }
    } catch (e) {}
  }, [isOpen]);

  // Step 1: Initial fetch for Vehicle Types & all base options on mount or drawer open
  useEffect(() => {
    if (isOpen) {
      setLoadingTypes(true);
      api
        .get('/fitments/options')
        .then((res) => {
          if (res.data) {
            setTypesList(res.data.types || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingTypes(false));
    }
  }, [isOpen]);

  // Step 2: When Type changes -> Enable & fetch Years
  useEffect(() => {
    setSelectedYear('');
    setSelectedMake('');
    setSelectedModel('');
    setYearsList([]);
    setMakesList([]);
    setModelsList([]);

    if (selectedType) {
      setLoadingYears(true);
      api
        .get('/fitments/options', { params: { type: selectedType } })
        .then((res) => {
          if (res.data) {
            setYearsList(res.data.years || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingYears(false));
    }
  }, [selectedType]);

  // Step 3: When Year changes -> Enable & fetch Makes
  useEffect(() => {
    setSelectedMake('');
    setSelectedModel('');
    setMakesList([]);
    setModelsList([]);

    if (selectedYear) {
      setLoadingMakes(true);
      const params: Record<string, string> = { year: selectedYear };
      if (selectedType) params.type = selectedType;

      api
        .get('/fitments/options', { params })
        .then((res) => {
          if (res.data) {
            setMakesList(res.data.makes || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingMakes(false));
    }
  }, [selectedType, selectedYear]);

  // Step 4: When Make changes -> Enable & fetch Models
  useEffect(() => {
    setSelectedModel('');
    setModelsList([]);

    if (selectedYear && selectedMake) {
      setLoadingModels(true);
      const params: Record<string, string> = { year: selectedYear, make: selectedMake };
      if (selectedType) params.type = selectedType;

      api
        .get('/fitments/options', { params })
        .then((res) => {
          if (res.data) {
            setModelsList(res.data.models || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingModels(false));
    }
  }, [selectedType, selectedYear, selectedMake]);

  // Submit Handler
  const handleFindVehicleProducts = (vType = selectedType, yr = selectedYear, mk = selectedMake, md = selectedModel) => {
    if (!yr || !mk || !md) return;

    // Save to Recent Vehicles
    const newVehicle: SavedVehicle = {
      id: `${yr}-${mk}-${md}`.toLowerCase().replace(/\s+/g, '-'),
      type: vType,
      year: yr,
      make: mk,
      model: md,
    };

    const existing = recentVehicles.filter((v) => v.id !== newVehicle.id);
    const updated = [newVehicle, ...existing].slice(0, 5);
    setRecentVehicles(updated);

    try {
      localStorage.setItem('bmg_recent_vehicles', JSON.stringify(updated));
    } catch (e) {}

    onClose();

    const queryParams = new URLSearchParams();
    if (vType) {
      queryParams.set('type', vType);
      queryParams.set('vehicle_type', vType);
    }
    queryParams.set('year', yr);
    queryParams.set('make', mk);
    queryParams.set('model', md);

    router.push(`/products?${queryParams.toString()}`);
  };

  const handleClearRecent = () => {
    setRecentVehicles([]);
    try {
      localStorage.removeItem('bmg_recent_vehicles');
    } catch (e) {}
  };

  if (!isOpen) return null;

  const isFormComplete = Boolean(selectedType && selectedYear && selectedMake && selectedModel);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Dark Overlay Background */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121212] border-l border-[#262626] text-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#222222] bg-[#161616] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bike className="w-5 h-5 text-[#BF8647]" />
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                SHOP YOUR RIDE
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scrollable Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Promo Card */}
            <div className="bg-[#1B1813] border border-[#BF8647]/40 p-4 rounded-xl space-y-2">
              <h3 className="text-xs font-black uppercase text-[#BF8647] tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> UNLOCK PERSONALIZED FITMENT!
              </h3>
              <ul className="text-xs text-gray-300 space-y-1 leading-relaxed">
                <li>• Easily find products guaranteed to fit your motorcycle</li>
                <li>• Filter 700+ tires, tubes, and performance components</li>
                <li>• Instant year, make, and model exact fit verification</li>
              </ul>
            </div>

            {/* Recent Vehicles Section */}
            {recentVehicles.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-wider">
                    RECENT VEHICLES ({recentVehicles.length})
                  </span>
                  <button
                    onClick={handleClearRecent}
                    className="text-[11px] text-gray-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {recentVehicles.map((v) => (
                    <div
                      key={v.id}
                      className="bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#BF8647] p-3 rounded-lg flex items-center justify-between transition-all group"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase">
                          {v.year} {v.make} {v.model}
                        </h4>
                        {v.type && (
                          <span className="text-[10px] text-[#BF8647] font-semibold uppercase">
                            {v.type}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleFindVehicleProducts(v.type, v.year, v.make, v.model)}
                        className="bg-[#BF8647] text-black text-[11px] font-black uppercase px-3 py-1.5 rounded hover:bg-[#D49A50] transition-colors flex items-center gap-1"
                      >
                        Shop Parts <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sequential Shop for New Vehicle Form */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-[#222] pb-2">
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                  <span>SHOP FOR NEW VEHICLE</span>
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
                </h3>
              </div>

              {/* STEP 1: Select Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-300 flex items-center justify-between">
                  <span>1. SELECT VEHICLE TYPE</span>
                  {selectedType && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  disabled={loadingTypes}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3.5 py-3 text-xs text-white uppercase font-bold focus:outline-none focus:border-[#BF8647] disabled:opacity-50 cursor-pointer"
                >
                  <option value="">-- SELECT BIKE TYPE --</option>
                  {typesList.length > 0
                    ? typesList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))
                    : ['Sportbike', 'Cruiser', 'Touring', 'Dirt', 'Street Bike', 'UTV/ATV'].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                </select>
              </div>

              {/* STEP 2: Select Year (Enabled ONLY after Type is selected) */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-bold uppercase flex items-center justify-between ${
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
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3.5 py-3 text-xs text-white uppercase font-bold focus:outline-none focus:border-[#BF8647] disabled:opacity-40 disabled:bg-[#141414] disabled:border-[#222] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">
                    {!selectedType
                      ? 'SELECT TYPE FIRST'
                      : loadingYears
                      ? 'LOADING YEARS...'
                      : '-- SELECT YEAR --'}
                  </option>
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 3: Select Make (Enabled ONLY after Year is selected) */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-bold uppercase flex items-center justify-between ${
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
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3.5 py-3 text-xs text-white uppercase font-bold focus:outline-none focus:border-[#BF8647] disabled:opacity-40 disabled:bg-[#141414] disabled:border-[#222] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">
                    {!selectedYear
                      ? 'SELECT YEAR FIRST'
                      : loadingMakes
                      ? 'LOADING MAKES...'
                      : '-- SELECT MAKE --'}
                  </option>
                  {makesList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 4: Select Model (Enabled ONLY after Make is selected) */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-bold uppercase flex items-center justify-between ${
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
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3.5 py-3 text-xs text-white uppercase font-bold focus:outline-none focus:border-[#BF8647] disabled:opacity-40 disabled:bg-[#141414] disabled:border-[#222] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">
                    {!selectedMake
                      ? 'SELECT MAKE FIRST'
                      : loadingModels
                      ? 'LOADING MODELS...'
                      : '-- SELECT MODEL --'}
                  </option>
                  {modelsList.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Drawer Footer CTA */}
          <div className="p-6 border-t border-[#222222] bg-[#161616]">
            <button
              onClick={() => handleFindVehicleProducts()}
              disabled={!isFormComplete}
              className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isFormComplete
                  ? 'bg-[#BF8647] text-black hover:bg-[#D49A50] shadow-lg shadow-[#BF8647]/20 scale-100 hover:scale-[1.02]'
                  : 'bg-[#222] text-gray-500 border border-[#333] cursor-not-allowed opacity-60'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>
                {isFormComplete ? 'FIND COMPATIBLE TIRES & PARTS' : 'SELECT ALL STEPS TO SEARCH'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
