'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchProducts, fetchCategories, fetchBrands } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Search, Filter, ShoppingBag, Bike, Check, X } from 'lucide-react';
import axios from 'axios';

function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [selectedMake, setSelectedMake] = useState(searchParams.get('make') || '');
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
  const [selectedPosition, setSelectedPosition] = useState(searchParams.get('position') || '');
  const [sort, setSort] = useState('newest');

  // Options State
  const [yearsList, setYearsList] = useState<string[]>([]);
  const [makesList, setMakesList] = useState<string[]>([]);
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [positionsList, setPositionsList] = useState<string[]>([]);
  const [brandsList, setBrandsList] = useState<string[]>([]);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Read fitments options
    axios.get('http://127.0.0.1:8000/api/fitments/options')
      .then((res) => {
        if (res.data) {
          setYearsList(res.data.years || []);
          setMakesList(res.data.makes || []);
          setModelsList(res.data.models || []);
          setPositionsList(res.data.positions || []);
        }
      }).catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (selectedBrand) params.brand = selectedBrand;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedYear) params.year = selectedYear;
    if (selectedMake) params.make = selectedMake;
    if (selectedModel) params.model = selectedModel;
    if (selectedPosition) params.position = selectedPosition;

    Promise.all([fetchProducts(params), fetchCategories(), fetchBrands()])
      .then(([prodRes, catRes, brandRes]) => {
        let list: any[] = [];
        if (Array.isArray(prodRes?.data?.data)) list = prodRes.data.data;
        else if (Array.isArray(prodRes?.data)) list = prodRes.data;
        else if (Array.isArray(prodRes)) list = prodRes;
        setProducts(list);

        if (catRes) setCategories(Array.isArray(catRes) ? catRes : []);
        if (brandRes && Array.isArray(brandRes)) {
          setBrandsList(brandRes.map((b: any) => b.name || b));
        } else {
          setBrandsList(['Dunlop', 'Michelin', 'Pirelli', 'Bridgestone', 'Metzeler', 'Shoei', 'PERFORMANCE MACHINE']);
        }
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [search, selectedBrand, selectedCategory, selectedYear, selectedMake, selectedModel, selectedPosition]);

  const resetAllFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedYear('');
    setSelectedMake('');
    setSelectedModel('');
    setSelectedPosition('');
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const sortedProducts = [...safeProducts].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    return b.id - a.id;
  });

  const activeFilterCount = [selectedBrand, selectedCategory, selectedYear, selectedMake, selectedModel, selectedPosition, search].filter(Boolean).length;

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        {/* Page Header */}
        <div className="bg-[#121212] border-b border-[#1E1E1E] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
              BMG CYCLES INVENTORY & CATALOGUE
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold uppercase text-white tracking-tight">
              MOTORCYCLE TIRES & FITMENT CATALOGUE
            </h1>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

          {/* Top Bike Fitment Bar */}
          <div className="bg-[#141414] border border-[#BF8647]/40 p-5 rounded-lg">
            <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#BF8647] uppercase tracking-wider">
                <Bike className="w-4 h-4" /> MOTORCYCLE FITMENT FILTER (YEAR / MAKE / MODEL / POSITION)
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] text-gray-400 hover:text-[#BF8647] uppercase font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear All Filters ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs uppercase font-semibold">
              {/* Year */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">YEAR</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white focus:border-[#BF8647] focus:outline-none"
                >
                  <option value="">ALL YEARS</option>
                  {yearsList.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Make */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">MAKE</label>
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white focus:border-[#BF8647] focus:outline-none"
                >
                  <option value="">ALL MAKES</option>
                  {makesList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">MODEL</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white focus:border-[#BF8647] focus:outline-none"
                >
                  <option value="">ALL MODELS</option>
                  {modelsList.map((mod) => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">POSITION</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white focus:border-[#BF8647] focus:outline-none"
                >
                  <option value="">FRONT & REAR</option>
                  <option value="Front">Front</option>
                  <option value="Rear">Rear</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">BRAND</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-white focus:border-[#BF8647] focus:outline-none"
                >
                  <option value="">ALL BRANDS</option>
                  {brandsList.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Search & Sort Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#141414] border border-[#222] p-4 rounded-lg">

            {/* Search Input (Part #, SKU, Name) */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Part Number (e.g. 0201-2382), SKU, Brand, or Model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-[#333] rounded pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#BF8647]"
              />
            </div>

            {/* Sort Select */}
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-[#333] rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#BF8647] uppercase font-bold"
              >
                <option value="newest">SORT BY: NEWEST</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
              </select>
            </div>

          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {loading ? (
            <div className="text-center py-20 text-gray-400 uppercase font-bold text-xs">Loading catalogue database...</div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-[#121212] rounded-lg border border-[#222]">
              <p className="text-lg font-bold uppercase text-white mb-2">No products match your filter criteria.</p>
              <p className="text-xs text-gray-400 mb-6">Try clearing your Year, Make, Model or Part Number search.</p>
              <button
                onClick={resetAllFilters}
                className="bg-[#BF8647] text-black px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#121212] border border-[#222] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#BF8647] transition-all group"
                >
                  <div className="relative bg-[#1A1A1A] p-6 h-64 flex items-center justify-center">
                    <img
                      src={product.primary_image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop'}
                      alt={product.name}
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-[#BF8647] text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      {product.brand}
                    </span>
                    <span className="absolute top-3 right-3 bg-[#1F1F1F] text-gray-400 text-[10px] font-mono px-2 py-0.5 rounded border border-[#333]">
                      PART #: {product.sku}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase line-clamp-2 mb-2 group-hover:text-[#BF8647] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                        {product.short_description || product.description}
                      </p>

                      {/* Display Fitment Badges if available */}
                      {product.fitments && product.fitments.length > 0 && (
                        <div className="mb-4 bg-[#181818] border border-[#262626] p-2.5 rounded text-[11px] text-gray-300 space-y-1">
                          <div className="text-[10px] text-[#BF8647] font-bold uppercase tracking-wider">CONFIRMED FITMENT:</div>
                          <div className="font-semibold line-clamp-1">
                            {product.fitments[0].year} {product.fitments[0].make} {product.fitments[0].model} ({product.fitments[0].position || 'Front/Rear'})
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-white">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${Number(product.compare_at_price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 uppercase text-xs font-bold">
                        <button
                          onClick={() => addItem(product, 1)}
                          className="bg-[#BF8647] text-black py-2.5 rounded hover:bg-[#D49A50] transition-colors"
                        >
                          Add To Cart
                        </button>
                        <Link
                          href={`/products/${product.slug}`}
                          className="border border-[#333] text-white py-2.5 rounded hover:border-[#BF8647] hover:text-[#BF8647] transition-colors text-center flex items-center justify-center"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="bg-[#0A0A0A] min-h-screen text-white p-10">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
