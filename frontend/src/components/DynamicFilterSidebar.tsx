'use client';

import React from 'react';
import { Filter, RotateCcw, ChevronDown, Check, DollarSign, Tag } from 'lucide-react';
import { AvailableFilters } from '@/lib/api';

interface DynamicFilterSidebarProps {
  filters?: AvailableFilters;
  selectedCategory: string;
  selectedBrand: string[];
  selectedAttributes: Record<string, string[]>;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (cat: string) => void;
  onBrandChange: (brands: string[]) => void;
  onAttributeChange: (slug: string, values: string[]) => void;
  onPriceChange: (min: string, max: string) => void;
  onReset: () => void;
}

export const DynamicFilterSidebar: React.FC<DynamicFilterSidebarProps> = ({
  filters,
  selectedCategory,
  selectedBrand,
  selectedAttributes,
  minPrice,
  maxPrice,
  onCategoryChange,
  onBrandChange,
  onAttributeChange,
  onPriceChange,
  onReset,
}) => {
  const toggleBrand = (brandName: string) => {
    if (selectedBrand.includes(brandName)) {
      onBrandChange(selectedBrand.filter((b) => b !== brandName));
    } else {
      onBrandChange([...selectedBrand, brandName]);
    }
  };

  const toggleAttributeValue = (attrSlug: string, val: string) => {
    const current = selectedAttributes[attrSlug] || [];
    if (current.includes(val)) {
      onAttributeChange(
        attrSlug,
        current.filter((v) => v !== val)
      );
    } else {
      onAttributeChange(attrSlug, [...current, val]);
    }
  };

  return (
    <aside className="w-full lg:w-72 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 text-slate-200 sticky top-24 self-start shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-slate-100">
          <Filter size={18} className="text-red-500" />
          <span>Dynamic Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors font-medium"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
        {/* Category Filter */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Tag size={13} className="text-red-400" /> Category
          </h4>
          <div className="space-y-1">
            {[
              { name: 'All Categories', slug: '' },
              { name: 'Motorcycle Tires', slug: 'motorcycle-tires' },
              { name: 'Helmets & Gear', slug: 'helmets-and-gear' },
              { name: 'Parts & Accessories', slug: 'parts-and-accessories' },
            ].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className={`w-full text-left text-xs font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === cat.slug
                    ? 'bg-red-600 text-white font-semibold shadow-md'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>{cat.name}</span>
                {selectedCategory === cat.slug && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        {filters?.brands && filters.brands.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Brand
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {filters.brands.map((brand) => {
                const isSelected = selectedBrand.includes(brand);
                return (
                  <label
                    key={brand}
                    className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none group"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Range Filter */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1">
            <DollarSign size={13} className="text-emerald-400" /> Price Range ($)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Dynamic Attributes Filter (From Laravel DB) */}
        {filters?.attributes && filters.attributes.length > 0 && (
          <div className="space-y-5 border-t border-slate-800/80 pt-4">
            {filters.attributes.map((attr) => (
              <div key={attr.id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {attr.name}
                  </span>
                  <ChevronDown size={14} className="text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  {attr.values.map((v) => {
                    const isChecked = (selectedAttributes[attr.slug] || []).includes(v.value);
                    return (
                      <label
                        key={v.id}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAttributeValue(attr.slug, v.value)}
                          className="rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900"
                        />
                        <span className="font-mono text-[11px] bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">
                          {v.label || v.value}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
