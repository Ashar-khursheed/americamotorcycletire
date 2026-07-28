'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/api';
import { ArrowUpDown, AlertCircle } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  totalCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  totalCount,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex-1">
      {/* Top Toolbar */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
            Product Catalog
          </h2>
          <p className="text-xs text-slate-400">
            Showing <span className="text-amber-400 font-bold">{products.length}</span> of{' '}
            <span className="text-slate-200 font-bold">{totalCount}</span> items matching filter criteria
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 font-medium"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 my-8">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider mb-1">
            No Products Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting or resetting your dynamic filters (e.g. tyre size, brand or price range).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
