'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, CheckCircle, ExternalLink, Zap } from 'lucide-react';
import { Product } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();

  const primaryImage = product.primary_image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop';
  const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);

  return (
    <div className="group bg-slate-900/90 rounded-2xl border border-slate-800/80 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Image & Badges */}
        <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />

          {/* Brand & Stock Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.brand && (
              <span className="px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                {product.brand}
              </span>
            )}
          </div>

          {hasDiscount && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
              SALE
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="p-5">
          {/* Dynamic Attributes Specs Tags */}
          {product.product_attribute_values && product.product_attribute_values.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {product.product_attribute_values.slice(0, 3).map((pav) => {
                const valStr = pav.attribute_value?.label || pav.attribute_value?.value || pav.custom_value;
                if (!valStr) return null;
                return (
                  <span
                    key={pav.id}
                    className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-md"
                  >
                    <Zap size={10} /> {valStr}
                  </span>
                );
              })}
            </div>
          )}

          <Link href={`/products/${product.slug}`} className="block group-hover:text-red-400 transition-colors">
            <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {product.short_description && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 font-normal leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>
      </div>

      {/* Footer & Pricing */}
      <div className="p-5 pt-0 border-t border-slate-800/50 mt-2 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-white">
              ${Number(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through">
                ${Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle size={10} /> In Stock ({product.stock_quantity})
          </span>
        </div>

        <button
          onClick={() => addItem(product)}
          className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-md shadow-red-950 hover:scale-105 active:scale-95 flex items-center gap-1.5"
          title="Add to Cart"
        >
          <ShoppingBag size={16} />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Add</span>
        </button>
      </div>
    </div>
  );
};
