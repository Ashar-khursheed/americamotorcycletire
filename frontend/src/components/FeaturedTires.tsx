'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export function FeaturedTires() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const addItem = useCartStore((state) => state.addItem);

  const brands = ['ALL', 'DUNLOP', 'MICHELIN', 'PIRELLI', 'BRIDGESTONE', 'METZELER'];

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((res) => {
        let list: any[] = [];
        if (Array.isArray(res?.data?.data)) {
          list = res.data.data;
        } else if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setProducts(list);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = selectedBrand === 'ALL'
    ? safeProducts
    : safeProducts.filter((p) => p.brand?.toUpperCase() === selectedBrand);

  return (
    <section className="bg-[#0A0A0A] py-16 lg:py-24 border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Brand Nav Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${selectedBrand === b
                  ? 'bg-[#BF8647] text-black shadow-lg'
                  : 'bg-[#141414] text-gray-400 border border-[#262626] hover:text-white hover:border-gray-500'
                }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
            PREMIUM SELECTION
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            FEATURED TIRES
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading tires catalogue...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-[#121212] rounded-lg border border-[#222]">
            No tires found in this brand.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredProducts.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="bg-[#121212] border border-[#222222] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#BF8647] transition-all group"
              >
                {/* Image */}
                <Link href={`/products/${product.slug}`} className="relative bg-[#1A1A1A] p-6 h-64 flex items-center justify-center overflow-hidden block cursor-pointer group">
                  <img
                    src={product.primary_image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop'}
                    alt={product.name}
                    className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#BF8647] text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    {product.brand}
                  </span>
                </Link>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-bold text-white uppercase line-clamp-2 mb-2 group-hover:text-[#BF8647] transition-colors cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                      {product.short_description || product.description}
                    </p>
                  </div>

                  <div>
                    {/* Price */}
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 uppercase text-xs font-bold">
                      <button
                        onClick={() => addItem(product, 1)}
                        className="bg-[#BF8647] text-black py-2.5 rounded hover:bg-[#D49A50] transition-colors text-center"
                      >
                        Buy Now
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

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-block bg-[#1A1A1A] border border-[#333] hover:border-[#BF8647] text-white hover:text-[#BF8647] px-8 py-3.5 rounded text-sm font-bold uppercase tracking-wider transition-all"
          >
            ALL MOTORCYCLE TIRES
          </Link>
        </div>

      </div>
    </section>
  );
}
