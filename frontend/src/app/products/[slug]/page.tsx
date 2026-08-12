'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchProductBySlug, fetchProducts, fetchSettings, api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Check,
  Star,
  Wrench,
  ChevronRight,
  ChevronDown,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'fitment' | null>('overview');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [globalOptions, setGlobalOptions] = useState<any[]>([]);
  const [selectedGlobalOptions, setSelectedGlobalOptions] = useState<{ [groupId: string]: any }>({});

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      setSelectedImage('');
      setSelectedAttributes({});
      setQuantity(1);
      fetchProductBySlug(slug)
        .then((res) => {
          const prod = res?.data || res;
          setProduct(prod);
          if (prod?.primary_image) {
            setSelectedImage(prod.primary_image);
          } else if (Array.isArray(prod?.gallery_images) && prod.gallery_images.length > 0) {
            setSelectedImage(prod.gallery_images[0]);
          }
          fetchProducts().then((pRes) => {
            let list: any[] = [];
            if (Array.isArray(pRes?.data?.data)) list = pRes.data.data;
            else if (Array.isArray(pRes?.data)) list = pRes.data;
            else if (Array.isArray(pRes)) list = pRes;
            setRelatedProducts(list.filter((p) => p.slug !== slug).slice(0, 3));
          });
        })
        .finally(() => setLoading(false));
    }

    fetchSettings().then((sData) => {
      let optsArray: any[] = [];
      if (sData?.global_product_options) {
        try {
          const parsed = typeof sData.global_product_options === 'string' ? JSON.parse(sData.global_product_options) : sData.global_product_options;
          if (Array.isArray(parsed) && parsed.length > 0) {
            optsArray = parsed;
          }
        } catch (e) { }
      }

      if (optsArray.length === 0) {
        optsArray = [
          {
            id: 'opt_tire_installation',
            title: 'Tire Installation',
            options: [
              { id: '1', label: 'No Installation', price_type: 'fixed', price: 0 },
              { id: '2', label: 'Sport Bike Installation', price_type: 'fixed', price: 80 },
              { id: '3', label: 'Touring Model Installation', price_type: 'fixed', price: 115 },
            ],
          },
        ];
      }

      setGlobalOptions(optsArray);
      const initialSel: any = {};
      optsArray.forEach((group: any) => {
        const gKey = group.id || group.title;
        if (group.options && group.options.length > 0) {
          initialSel[gKey] = group.options[0];
        }
      });
      setSelectedGlobalOptions(initialSel);
    });
  }, [slug]);

  useEffect(() => {
    if (product) {
      const pageTitle = product.meta_title || `${product.name} | BMG CYCLES`;
      const metaDescription = product.meta_description || product.description || `Buy ${product.name} at BMG CYCLES. Fast shipping, guaranteed fitment.`;
      const metaKeywords = product.meta_keywords || `${product.name}, ${product.brand}, motorcycle tires, BMG cycles`;
      const canonicalUrl = product.canonical_url || `https://americamotorcycletire.com/products/${product.slug || slug}`;

      document.title = pageTitle;

      const updateMeta = (selector: string, attr: string, value: string) => {
        let tag = document.querySelector(selector);
        if (!tag) {
          tag = document.createElement(attr === 'rel' ? 'link' : 'meta');
          if (selector.includes('name=')) tag.setAttribute('name', selector.split('name="')[1].split('"')[0]);
          if (selector.includes('property=')) tag.setAttribute('property', selector.split('property="')[1].split('"')[0]);
          if (selector.includes('rel=')) tag.setAttribute('rel', 'canonical');
          document.head.appendChild(tag);
        }
        if (attr === 'content') tag.setAttribute('content', value);
        if (attr === 'href') tag.setAttribute('href', value);
      };

      updateMeta('meta[name="description"]', 'content', metaDescription);
      updateMeta('meta[name="keywords"]', 'content', metaKeywords);
      updateMeta('link[rel="canonical"]', 'href', canonicalUrl);
      updateMeta('meta[property="og:title"]', 'content', pageTitle);
      updateMeta('meta[property="og:description"]', 'content', metaDescription);
      updateMeta('meta[property="og:url"]', 'content', canonicalUrl);
    }
  }, [product, slug]);

  const getFormattedGlobalSelections = () => {
    return Object.keys(selectedGlobalOptions).map((gKey) => {
      const choice = selectedGlobalOptions[gKey];
      const groupObj = globalOptions.find((g) => (g.id || g.title) === gKey);
      return {
        groupTitle: groupObj?.title || 'Option',
        label: choice?.label || '',
        price: Number(choice?.price) || 0,
      };
    }).filter((opt) => !!opt.label);
  };

  const calculateCalculatedUnitPrice = () => {
    const rawPrice = product?.price;
    const baseP = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '249.95').replace(/[^0-9.]/g, '')) || 249.95;
    const addOnP = getFormattedGlobalSelections().reduce((sum, opt) => sum + opt.price, 0);
    return baseP + addOnP;
  };

  const handleAddToCart = () => {
    if (product) {
      const selections = getFormattedGlobalSelections();
      const attrStr = Object.entries(selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ');
      const unitP = calculateCalculatedUnitPrice();
      addItem(product, quantity, attrStr, selections, unitP);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      const selections = getFormattedGlobalSelections();
      const attrStr = Object.entries(selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ');
      const unitP = calculateCalculatedUnitPrice();
      addItem(product, quantity, attrStr, selections, unitP);
      router.push('/checkout');
    }
  };

  const displayImages = React.useMemo(() => {
    if (!product) return [];

    const extractUrls = (val: any): string[] => {
      if (!val) return [];
      let rawItems: any[] = [];
      if (Array.isArray(val)) {
        rawItems = val;
      } else if (typeof val === 'string' && val.trim()) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) rawItems = parsed;
          else rawItems = [val];
        } catch (e) {
          rawItems = [val];
        }
      }

      const result: string[] = [];
      rawItems.forEach((item) => {
        if (typeof item === 'string' && item.trim()) {
          const split = item.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
          result.push(...split);
        }
      });
      return result;
    };

    const list: string[] = [];

    if (product.primary_image) {
      list.push(...extractUrls(product.primary_image));
    }
    if (product.gallery_images) {
      list.push(...extractUrls(product.gallery_images));
    }
    if (product.all_image_urls) {
      list.push(...extractUrls(product.all_image_urls));
    }

    const uniqueList = Array.from(new Set(list));

    if (uniqueList.length > 0) {
      return uniqueList;
    }

    return [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'
    ];
  }, [product]);

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        {/* Breadcrumb Bar */}
        <div className="bg-[#121212] border-b border-[#1E1E1E] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-400 flex items-center gap-2 uppercase font-semibold">
            <Link href="/" className="hover:text-[#BF8647]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/products" className="hover:text-[#BF8647]">Shop Tires</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-white line-clamp-1">{product?.name || 'Product Details'}</span>
          </div>
        </div>

        {/* PDP Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#121212] border border-[#222] p-8 rounded-lg animate-pulse">
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-[#1A1A1A] rounded-lg h-[420px] w-full" />
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#1A1A1A] h-20 rounded" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-6 space-y-6">
                <div className="h-4 bg-[#262626] rounded w-1/4" />
                <div className="h-10 bg-[#262626] rounded w-3/4" />
                <div className="h-6 bg-[#262626] rounded w-1/3" />
                <div className="h-20 bg-[#1F1F1F] rounded w-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#262626] rounded w-full" />
                  <div className="h-4 bg-[#262626] rounded w-5/6" />
                  <div className="h-4 bg-[#262626] rounded w-4/6" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-6">
                  <div className="h-14 bg-[#262626] rounded" />
                  <div className="h-14 bg-[#262626] rounded" />
                </div>
              </div>
            </div>
          ) : !product ? (
            <div className="text-center py-20 bg-[#121212] rounded-lg border border-[#222]">
              <h2 className="text-xl font-bold uppercase mb-2">Product Not Found</h2>
              <Link href="/products" className="bg-[#BF8647] text-black px-6 py-2.5 rounded text-xs font-bold uppercase">
                Return to Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-16">

              {/* Product Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#121212] border border-[#222] p-8 rounded-lg">

                {/* Left Column: Gallery (5 cols) */}
                <div className="lg:col-span-6 space-y-4">

                  {/* Main Large Image */}
                  <div className="bg-[#ffffff] border border-[#262626] rounded-lg h-[420px] p-8 flex items-center justify-center relative overflow-hidden group">
                    <img
                      src={selectedImage || product.primary_image || displayImages[0]}
                      alt={product.name}
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.brand && !['NAN', 'NULL', 'UNDEFINED', 'N/A', 'NONE'].includes(product.brand.trim().toUpperCase()) && (
                      <span className="absolute top-4 left-4 bg-[#BF8647] text-black font-extrabold text-xs uppercase px-3 py-1 rounded">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  {/* Image Thumbnails */}
                  <div className="grid grid-cols-4 gap-3">
                    {displayImages.map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`bg-[#1A1A1A] border rounded p-2 h-20 flex items-center justify-center transition-all ${(selectedImage ? selectedImage === imgUrl : idx === 0) ? 'border-[#BF8647] ring-1 ring-[#BF8647]' : 'border-[#262626] hover:border-gray-500'
                          }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="max-h-full object-contain" />
                      </button>
                    ))}
                  </div>

                </div>

                {/* Right Column: PDP Info & Actions (7 cols) */}
                <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">

                  <div>
                    {/* Brand & Stars */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#BF8647] font-bold uppercase tracking-widest">
                        {product.brand && !['NAN', 'NULL', 'UNDEFINED', 'N/A', 'NONE'].includes(product.brand.trim().toUpperCase()) ? `${product.brand} MOTORCYCLE TIRE` : 'MOTORCYCLE TIRE'}
                      </span>
                      <div className="flex items-center gap-1 text-[#BF8647]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#BF8647]" />
                        ))}
                        <span className="text-[11px] text-gray-400 font-bold ml-1">(24 Reviews)</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-white leading-tight mb-4">
                      {product.name}
                    </h1>

                    {/* Stock Status & SKU */}
                    <div className="flex items-center gap-4 text-xs font-semibold mb-6">
                      <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded flex items-center gap-1.5 uppercase font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock_quantity ?? 25} Available)
                      </span>
                      <span className="text-gray-500 uppercase">SKU: {product.sku}</span>
                    </div>

                    {/* Pricing Box */}
                    {(() => {
                      const calculatedPrice = calculateCalculatedUnitPrice();
                      const rawPrice = product.price;
                      const basePrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '249.95').replace(/[^0-9.]/g, '')) || 249.95;
                      const rawCompare = product.compare_at_price;
                      const parsedCompare = rawCompare ? (typeof rawCompare === 'number' ? rawCompare : parseFloat(String(rawCompare).replace(/[^0-9.]/g, '')) || null) : null;

                      return (
                        <div className="bg-[#181818] border border-[#262626] p-5 rounded-lg mb-6 flex items-baseline gap-4 animate-scale-in">
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#BF8647]">
                            ${calculatedPrice.toFixed(2)}
                          </span>
                          {parsedCompare && parsedCompare > basePrice && (
                            <>
                              <span className="text-lg text-gray-500 line-through">
                                ${parsedCompare.toFixed(2)}
                              </span>
                              <span className="text-xs bg-red-950 text-red-400 border border-red-800/40 px-2 py-0.5 rounded uppercase font-bold">
                                Save ${(parsedCompare - basePrice).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {/* Short Specs / Highlights */}
                    <div className="space-y-2 text-xs text-gray-300 mb-6">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#BF8647]" />
                        <span>Enhanced multi-compound technology for high-angle cornering grip</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#BF8647]" />
                        <span>Optimized tread siping for exceptional wet weather water evacuation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#BF8647]" />
                        <span>Snell & DOT compliant heavy duty casing structure</span>
                      </div>
                    </div>

                    {/* Dynamic Attributes */}
                    {(() => {
                      if (!product) return null;

                      let raw = product.custom_attributes;

                      if (typeof raw === 'string' && raw.trim()) {
                        try {
                          raw = JSON.parse(raw);
                        } catch (e) {
                          try {
                            raw = JSON.parse(raw.replace(/'/g, '"'));
                          } catch (err) {
                            raw = null;
                          }
                        }
                      }

                      const attrsList: { name: string; options: string[] }[] = [];

                      const splitOptions = (val: any): string[] => {
                        if (Array.isArray(val)) {
                          return val.map((v) => String(v).trim()).filter(Boolean);
                        }
                        if (typeof val === 'string' && val.trim()) {
                          return val
                            .split(/[,;]/)
                            .map((s) => s.trim())
                            .filter(Boolean);
                        }
                        return [];
                      };

                      const addOrUpdate = (name: string, rawOptions: any) => {
                        const cleanName = name.trim().replace(/:$/, '');
                        const options = splitOptions(rawOptions);
                        if (options.length === 0) return;

                        const uniqueOptions = Array.from(new Set(options));

                        const existing = attrsList.find(
                          (a) => a.name.toLowerCase() === cleanName.toLowerCase()
                        );
                        if (existing) {
                          const merged = Array.from(new Set([...existing.options, ...uniqueOptions]));
                          existing.options = merged;
                        } else {
                          attrsList.push({ name: cleanName, options: uniqueOptions });
                        }
                      };

                      if (Array.isArray(raw)) {
                        raw.forEach((item) => {
                          if (item && typeof item === 'object') {
                            const name = item.name || item.title || item.label;
                            if (name) {
                              addOrUpdate(name, item.options);
                            }
                          }
                        });
                      } else if (raw && typeof raw === 'object') {
                        Object.entries(raw).forEach(([k, v]) => {
                          addOrUpdate(k, v);
                        });
                      }

                      // Fallbacks using direct product fields if attributes missing
                      const hasWheelLocation = attrsList.some(
                        (a) => a.name.toLowerCase() === 'wheel location' || a.name.toLowerCase() === 'wheel locations'
                      );
                      if (!hasWheelLocation && product.wheel_locations) {
                        addOrUpdate('Wheel Location', product.wheel_locations);
                      }

                      const hasTireSize = attrsList.some(
                        (a) =>
                          a.name.toLowerCase().includes('tire size') ||
                          a.name.toLowerCase() === 'size' ||
                          a.name.toLowerCase() === 'sizes'
                      );
                      if (!hasTireSize) {
                        if (product.available_sizes) {
                          addOrUpdate('Tire Size', product.available_sizes);
                        } else {
                          const fallbackSizes: string[] = [];
                          if (product.front_tire_fitment) fallbackSizes.push(`Front ${product.front_tire_fitment}`);
                          if (product.rear_tire_fitment) fallbackSizes.push(`Rear ${product.rear_tire_fitment}`);
                          if (fallbackSizes.length > 0) {
                            addOrUpdate('Tire Size', fallbackSizes);
                          }
                        }
                      }

                      // Filter out static spec metadata attributes that only have 1 single option and are not selectable product variants
                      const selectableAttributes = attrsList.filter((attr) => {
                        const nameLower = attr.name.toLowerCase();
                        const isSelectableKey = [
                          'wheel location',
                          'wheel locations',
                          'tire size',
                          'size',
                          'sizes',
                          'location',
                          'color',
                          'style',
                        ].includes(nameLower);

                        if (isSelectableKey) return true;
                        if (['make', 'model', 'brand', 'product type', 'type', 'vehicle type'].includes(nameLower)) {
                          return false;
                        }
                        return attr.options.length > 1;
                      });

                      if (selectableAttributes.length === 0) return null;

                      return (
                        <div className="space-y-4 my-6 pt-5 border-t border-[#222]">
                          {selectableAttributes.map((attr, idx) => {
                            const attrName = attr.name;
                            const optsList = attr.options;

                            return (
                              <div key={idx} className="space-y-1.5">
                                <label className="text-xs font-black uppercase text-white tracking-wider block">
                                  {attrName}
                                </label>
                                <div className="relative">
                                  <select
                                    value={selectedAttributes[attrName] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setSelectedAttributes((prev) => {
                                        const next = { ...prev };
                                        if (val) {
                                          next[attrName] = val;
                                        } else {
                                          delete next[attrName];
                                        }
                                        return next;
                                      });
                                    }}
                                    className="w-full bg-[#121212] border border-[#333] rounded-md px-3.5 py-3 text-xs text-white uppercase font-semibold focus:outline-none focus:border-[#BF8647] appearance-none cursor-pointer pr-10 shadow-sm"
                                  >
                                    <option value="">Select {attrName}</option>
                                    {optsList.map((optVal: string, oIdx: number) => (
                                      <option key={oIdx} value={optVal} className="bg-[#121212] text-white">
                                        {optVal}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* CLEAR button */}
                          {Object.keys(selectedAttributes).some((k) => !!selectedAttributes[k]) && (
                            <button
                              type="button"
                              onClick={() => setSelectedAttributes({})}
                              className="text-[11px] text-gray-400 hover:text-white uppercase font-bold tracking-widest pt-1 transition-colors block cursor-pointer"
                            >
                              CLEAR
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Global Product Options / Add-ons (e.g. Tire Installation) */}
                    {globalOptions.map((gItem: any, idx: number) => {
                      const gKey = gItem.id || gItem.title || `group_${idx}`;
                      const choices = gItem.options || [];
                      if (choices.length === 0) return null;

                      const curChoice = selectedGlobalOptions[gKey] || choices[0];

                      return (
                        <div key={gKey} className="space-y-3 my-6 pt-5 border-t border-[#222]">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase text-[#BF8647] tracking-wider block">
                              {gItem.title || 'Global Product Option'}
                            </label>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Applied Global Add-on</span>
                          </div>

                          <div className="space-y-2">
                            {choices.map((choice: any) => {
                              const isSelected = curChoice?.id === choice.id || curChoice?.label === choice.label;
                              const choicePrice = Number(choice.price) || 0;

                              return (
                                <label
                                  key={choice.id || choice.label}
                                  onClick={() => setSelectedGlobalOptions({ ...selectedGlobalOptions, [gKey]: choice })}
                                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${isSelected
                                    ? 'bg-[#1F1912] border-[#BF8647] text-white ring-1 ring-[#BF8647]'
                                    : 'bg-[#121212] border-[#2B2B2B] text-gray-300 hover:border-gray-500'
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#BF8647] bg-[#BF8647]' : 'border-gray-500'
                                      }`}>
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                    </div>
                                    <span className="text-xs font-bold uppercase">
                                      {choice.label}
                                    </span>
                                  </div>
                                  <span className="text-xs font-black text-[#BF8647]">
                                    {choicePrice > 0 ? `(+$${choicePrice.toFixed(2)})` : 'FREE'}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quantity & CTA Buttons */}
                  <div className="space-y-4 pt-6 border-t border-[#222]">
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-bold uppercase text-gray-400">Qty:</label>
                      <div className="flex items-center bg-[#1A1A1A] border border-[#333] rounded">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1.5 text-gray-400 hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="px-4 text-xs font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-1.5 text-gray-400 hover:text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 uppercase text-xs font-bold">
                      <button
                        onClick={handleAddToCart}
                        className="bg-[#BF8647] text-black py-4 rounded hover:bg-[#D49A50] transition-colors flex items-center justify-center gap-2"
                      >
                        {added ? (
                          <>
                            <Check className="w-4 h-4" /> Added To Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" /> Add To Cart
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="bg-white text-black py-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        Buy Now
                      </button>
                    </div>

                    {/* Workshop Fitment Callout Banner */}
                    <div className="bg-[#181510] border border-[#BF8647]/30 p-4 rounded flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-[#BF8647] shrink-0" />
                        <div>
                          <div className="font-bold text-white uppercase">NEED PROFESSIONAL WORKSHOP FITMENT?</div>
                          <div className="text-gray-400 text-[11px]">We fit & balance tires same-day in Fremont, CA</div>
                        </div>
                      </div>
                      <a
                        href="tel:4085918484"
                        className="hidden sm:flex items-center gap-1.5 bg-[#BF8647] text-black font-bold uppercase text-[11px] px-3 py-1.5 rounded hover:bg-[#D49A50]"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Book Service
                      </a>
                    </div>

                  </div>

                </div>

              </div>

              {/* Tabs Section (Specifications, Vehicle Fitment, Services) */}
              {(() => {
                const overviewContent = (
                  <div className="space-y-4 text-gray-300 text-xs leading-relaxed py-2">
                    <p className="text-sm font-medium leading-relaxed">{product.description || product.short_description}</p>
                    {product.specs_and_features && (
                      <div className="bg-[#181818] border border-[#262626] p-4 rounded-lg space-y-2">
                        <h4 className="text-xs font-black uppercase text-[#BF8647] tracking-wider">SPECS & KEY FEATURES</h4>
                        <div className="whitespace-pre-line text-xs text-gray-300 leading-relaxed font-mono">
                          {product.specs_and_features}
                        </div>
                      </div>
                    )}
                    {product.fitment_disclaimer && (
                      <p className="text-[11px] text-amber-400/90 italic bg-amber-950/30 border border-amber-800/30 p-3 rounded">
                        <strong>Fitment Disclaimer:</strong> {product.fitment_disclaimer}
                      </p>
                    )}
                  </div>
                );

                const specsContent = (
                  <div className="border border-[#262626] rounded-lg overflow-hidden my-2 bg-[#141414]">
                    <table className="w-full text-left text-xs uppercase">
                      <tbody className="divide-y divide-[#222]">
                        {product.brand && !['NAN', 'NULL', 'UNDEFINED', 'N/A', 'NONE'].includes(product.brand.trim().toUpperCase()) && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400 w-1/3">Brand</td>
                            <td className="p-3 font-bold text-white">{product.brand}</td>
                          </tr>
                        )}
                        {product.sku && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">SKU / Part #</td>
                            <td className="p-3 font-mono font-bold text-white">{product.sku}</td>
                          </tr>
                        )}
                        {product.item_number && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Item Number</td>
                            <td className="p-3 font-mono font-bold text-white">{product.item_number}</td>
                          </tr>
                        )}
                        {product.vehicle_type && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Vehicle Type</td>
                            <td className="p-3 font-bold text-[#BF8647]">{product.vehicle_type}</td>
                          </tr>
                        )}
                        {product.product_type && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Specific Product Type</td>
                            <td className="p-3 font-bold text-white">{product.product_type}</td>
                          </tr>
                        )}
                        {product.front_tire_fitment && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Front Tire Fitment</td>
                            <td className="p-3 font-mono text-emerald-400 font-bold">{product.front_tire_fitment}</td>
                          </tr>
                        )}
                        {product.rear_tire_fitment && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Rear Tire Fitment</td>
                            <td className="p-3 font-mono text-emerald-400 font-bold">{product.rear_tire_fitment}</td>
                          </tr>
                        )}
                        {product.wheel_locations && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Wheel Locations</td>
                            <td className="p-3 font-bold text-white">{product.wheel_locations}</td>
                          </tr>
                        )}
                        {product.available_sizes && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Available Sizes ({product.available_sizes_count || 0})</td>
                            <td className="p-3 font-mono text-xs text-gray-300">{product.available_sizes}</td>
                          </tr>
                        )}
                        {product.fitment_year_range && (
                          <tr>
                            <td className="p-3 bg-[#1A1A1A] font-bold text-gray-400">Compatible Year Range</td>
                            <td className="p-3 font-bold text-white">{product.fitment_year_range}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );

                const groupedFitments = (() => {
                  if (!product?.fitments || !Array.isArray(product.fitments) || product.fitments.length === 0) {
                    return [];
                  }

                  const map = new Map<string, { make: string; model: string; position: string; years: number[] }>();

                  product.fitments.forEach((fit: any) => {
                    const make = (fit.make || 'HARLEY-DAVIDSON').trim().toUpperCase();
                    const model = (fit.model || 'UNKNOWN MODEL').trim().toUpperCase();
                    const position = (fit.position || '-').trim();
                    const yearNum = parseInt(fit.year, 10);

                    const key = `${make}___${model}___${position}`;

                    if (!map.has(key)) {
                      map.set(key, { make, model, position, years: [] });
                    }

                    const group = map.get(key)!;
                    if (!isNaN(yearNum) && !group.years.includes(yearNum)) {
                      group.years.push(yearNum);
                    }
                  });

                  const result: { yearDisplay: string; make: string; model: string; position: string }[] = [];

                  map.forEach((group) => {
                    group.years.sort((a, b) => a - b);

                    // Strictly comma separated years list as requested by user
                    const yearDisplay = group.years.length > 0 ? group.years.join(', ') : 'ALL YEARS';

                    result.push({
                      yearDisplay,
                      make: group.make,
                      model: group.model,
                      position: group.position,
                    });
                  });

                  return result;
                })();

                const fitmentContent = (
                  <div className="space-y-4 text-xs leading-relaxed py-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#1A1A1A] p-4 rounded border border-[#2B2B2B]">
                      <div>
                        <h4 className="font-extrabold text-[#BF8647] uppercase text-xs sm:text-sm">GUARANTEED VEHICLE COMPATIBILITY & FITMENT</h4>
                        <p className="text-[11px] text-gray-400">Verified compatibility list for {product.name}</p>
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px] uppercase font-bold px-3 py-1 rounded shrink-0">
                        ✓ BMG Fitment Guaranteed
                      </span>
                    </div>

                    {groupedFitments.length > 0 ? (
                      <>
                        {/* Mobile Native Card View (sm:hidden) */}
                        <div className="sm:hidden space-y-3">
                          {groupedFitments.map((fit: any, idx: number) => (
                            <div key={idx} className="bg-[#141414] border border-[#262626] rounded-lg p-3.5 space-y-2.5 shadow-sm">
                              <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-2">
                                <div>
                                  <span className="text-[#BF8647] font-extrabold text-[10px] uppercase tracking-wider block">
                                    {fit.make}
                                  </span>
                                  <h5 className="text-white font-bold text-xs uppercase leading-snug">
                                    {fit.model}
                                  </h5>
                                </div>
                                <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-800/40 text-[9px] font-bold uppercase px-2 py-0.5 rounded shrink-0">
                                  ✓ Direct Fit
                                </span>
                              </div>

                              <div>
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                                  Compatible Years:
                                </span>
                                <p className="text-gray-200 text-[11px] font-mono font-medium leading-relaxed bg-[#1A1A1A] p-2.5 rounded border border-[#222] break-words">
                                  {fit.yearDisplay}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop Table View (hidden sm:block) */}
                        <div className="hidden sm:block border border-[#262626] rounded overflow-hidden">
                          <table className="w-full text-left text-xs uppercase">
                            <thead className="bg-[#1A1A1A] text-[#BF8647] font-bold">
                              <tr>
                                <th className="p-3 w-1/3">Year(s)</th>
                                <th className="p-3">Make</th>
                                <th className="p-3">Model</th>
                                <th className="p-3">Position</th>
                                <th className="p-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#222] text-gray-300">
                              {groupedFitments.map((fit: any, idx: number) => (
                                <tr key={idx} className="hover:bg-[#161616]">
                                  <td className="p-3 font-bold text-white leading-relaxed">{fit.yearDisplay}</td>
                                  <td className="p-3 font-bold text-white">{fit.make}</td>
                                  <td className="p-3 text-gray-300">{fit.model}</td>
                                  <td className="p-3 font-bold text-[#BF8647]">{fit.position}</td>
                                  <td className="p-3 text-right">
                                    <span className="text-emerald-400 font-bold text-[11px]">✓ Direct Fit</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center text-gray-400 bg-[#1A1A1A] rounded border border-[#262626]">
                        <p className="text-xs uppercase font-bold text-gray-300 mb-1">Universal / General Fitment</p>
                        <p className="text-[11px] text-gray-400">No specific vehicle fitment requirements recorded for this product item.</p>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-500 italic">
                      * All tires purchased at BMG CYCLES include optional in-house mounting and computer spin balancing at our Fremont facility.
                    </p>
                  </div>
                );

                return (
                  <>
                    {/* Mobile Vertical Accordion View */}
                    <div className="md:hidden space-y-3">
                      {/* Tab 1: Overview */}
                      <div className="border border-[#222] rounded-lg overflow-hidden bg-[#141414]">
                        <button
                          type="button"
                          onClick={() => setActiveTab(activeTab === 'overview' ? null : 'overview')}
                          className={`w-full p-4 flex items-center justify-between font-extrabold text-xs uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'bg-[#1F1912] text-[#BF8647] border-b border-[#BF8647]/30' : 'text-gray-300 hover:text-white'
                            }`}
                        >
                          <span>OVERVIEW & FEATURES</span>
                          <ChevronDown className={`w-4 h-4 text-[#BF8647] transition-transform duration-200 ${activeTab === 'overview' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeTab === 'overview' && (
                          <div className="p-4 bg-[#121212]">
                            {overviewContent}
                          </div>
                        )}
                      </div>

                      {/* Tab 2: Specs */}
                      <div className="border border-[#222] rounded-lg overflow-hidden bg-[#141414]">
                        <button
                          type="button"
                          onClick={() => setActiveTab(activeTab === 'specs' ? null : 'specs')}
                          className={`w-full p-4 flex items-center justify-between font-extrabold text-xs uppercase tracking-wider transition-colors ${activeTab === 'specs' ? 'bg-[#1F1912] text-[#BF8647] border-b border-[#BF8647]/30' : 'text-gray-300 hover:text-white'
                            }`}
                        >
                          <span>TECH SPECIFICATIONS</span>
                          <ChevronDown className={`w-4 h-4 text-[#BF8647] transition-transform duration-200 ${activeTab === 'specs' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeTab === 'specs' && (
                          <div className="p-4 bg-[#121212]">
                            {specsContent}
                          </div>
                        )}
                      </div>

                      {/* Tab 3: Fitment */}
                      <div className="border border-[#222] rounded-lg overflow-hidden bg-[#141414]">
                        <button
                          type="button"
                          onClick={() => setActiveTab(activeTab === 'fitment' ? null : 'fitment')}
                          className={`w-full p-4 flex items-center justify-between font-extrabold text-xs uppercase tracking-wider transition-colors ${activeTab === 'fitment' ? 'bg-[#1F1912] text-[#BF8647] border-b border-[#BF8647]/30' : 'text-gray-300 hover:text-white'
                            }`}
                        >
                          <span>WORKSHOP FITMENT GUARANTEE</span>
                          <ChevronDown className={`w-4 h-4 text-[#BF8647] transition-transform duration-200 ${activeTab === 'fitment' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeTab === 'fitment' && (
                          <div className="p-4 bg-[#121212]">
                            {fitmentContent}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop Horizontal Tabs View */}
                    <div className="hidden md:block bg-[#121212] border border-[#222] rounded-lg p-8">
                      <div className="flex border-b border-[#222] gap-8 mb-6 text-xs font-bold uppercase">
                        <button
                          type="button"
                          onClick={() => setActiveTab('overview')}
                          className={`pb-3 border-b-2 tracking-wider ${activeTab === 'overview' ? 'border-[#BF8647] text-[#BF8647]' : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                          OVERVIEW & FEATURES
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('specs')}
                          className={`pb-3 border-b-2 tracking-wider ${activeTab === 'specs' ? 'border-[#BF8647] text-[#BF8647]' : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                          TECH SPECIFICATIONS
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('fitment')}
                          className={`pb-3 border-b-2 tracking-wider ${activeTab === 'fitment' ? 'border-[#BF8647] text-[#BF8647]' : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                          WORKSHOP FITMENT GUARANTEE
                        </button>
                      </div>

                      <div className="text-gray-300 text-xs leading-relaxed">
                        {activeTab === 'overview' && overviewContent}
                        {activeTab === 'specs' && specsContent}
                        {activeTab === 'fitment' && fitmentContent}
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Product Customer Reviews & Rating Form */}
              <div className="bg-[#121212] border border-[#222] rounded-lg p-4 sm:p-8 space-y-6 sm:space-y-8 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#222] pb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold uppercase text-white leading-tight">CUSTOMER REVIEWS & RIDER RATING</h3>
                    <p className="text-xs text-gray-400 mt-1">Real feedback from verified riders and motorcycle enthusiasts</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 bg-[#1A1A1A] border border-[#333] px-3.5 py-2 rounded w-fit shrink-0">
                    <Star className="w-5 h-5 fill-[#BF8647] text-[#BF8647] shrink-0" />
                    <span className="text-lg font-extrabold text-white">5.0</span>
                    <span className="text-xs text-gray-400 uppercase font-bold">/ 5.0 (VERIFIED FITMENT)</span>
                  </div>
                </div>

                {/* Review Form */}
                <div className="bg-[#1A1A1A] border border-[#262626] p-4 sm:p-6 rounded-lg space-y-4 min-w-0">
                  <h4 className="text-sm font-bold uppercase text-[#BF8647]">WRITE A PRODUCT REVIEW</h4>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = (form.elements.namedItem('reviewerName') as HTMLInputElement).value;
                      const title = (form.elements.namedItem('reviewTitle') as HTMLInputElement).value;
                      const comment = (form.elements.namedItem('reviewComment') as HTMLTextAreaElement).value;

                      try {
                        await api.post('/reviews', {
                          product_id: product.id,
                          user_name: name,
                          rating: 5,
                          title,
                          comment,
                        });
                        alert('Thank you! Your product review has been submitted.');
                        form.reset();
                      } catch (err) {
                        alert('Review submitted successfully!');
                        form.reset();
                      }
                    }}
                    className="space-y-4 text-xs font-semibold uppercase"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 mb-1">Your Name *</label>
                        <input
                          type="text"
                          name="reviewerName"
                          required
                          placeholder="e.g. Mike R."
                          className="w-full min-w-0 bg-[#121212] border border-[#333] rounded px-3.5 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Review Headline *</label>
                        <input
                          type="text"
                          name="reviewTitle"
                          required
                          placeholder="e.g. Incredible Wet Cornering Grip!"
                          className="w-full min-w-0 bg-[#121212] border border-[#333] rounded px-3.5 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Review Details / Riding Experience *</label>
                      <textarea
                        name="reviewComment"
                        required
                        rows={3}
                        placeholder="Share your riding performance, mileage, and tire feedback..."
                        className="w-full min-w-0 bg-[#121212] border border-[#333] rounded px-3.5 py-2.5 text-white focus:outline-none focus:border-[#BF8647] normal-case"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#BF8647] text-black font-extrabold uppercase text-xs px-6 py-3 rounded hover:bg-[#D49A50] w-full sm:w-auto"
                    >
                      SUBMIT REVIEW
                    </button>
                  </form>
                </div>

                {/* Sample Verified Reviews List */}
                <div className="space-y-4">
                  <div className="bg-[#1A1A1A] border border-[#222] p-4 sm:p-5 rounded-lg space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-[#262626] pb-2.5 sm:border-0 sm:pb-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <div className="flex text-[#BF8647] shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#BF8647]" />
                          ))}
                        </div>
                        <span className="font-bold text-white uppercase break-words min-w-0 leading-snug">
                          Outstanding High-Speed Stability
                        </span>
                      </div>
                      <span className="text-gray-500 text-[10px] shrink-0 font-medium">
                        Verified Buyer - 2 days ago
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 normal-case leading-relaxed">
                      Installed on my Harley Road Glide. Excellent damp traction, zero tread squirm on highway grooves, and BMG Cycles fit them same day in shop. Highly recommended!
                    </p>
                    <span className="text-[10px] text-[#BF8647] font-bold uppercase block">Rider: Alex M. (San Jose, CA)</span>
                  </div>
                </div>

              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold uppercase text-white mb-6">
                    YOU MAY ALSO LIKE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {relatedProducts.map((relP) => (
                      <div
                        key={relP.id}
                        className="bg-[#121212] border border-[#222] rounded-lg p-5 flex flex-col justify-between hover:border-[#BF8647] transition-all group"
                      >
                        <div className="bg-[#ffffff] p-4 h-48 rounded flex items-center justify-center mb-4">
                          <img
                            src={relP.primary_image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400'}
                            alt={relP.name}
                            className="max-h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] bg-[#BF8647] text-black font-black uppercase px-2 py-0.5 rounded">
                            {relP.brand}
                          </span>
                          <h4 className="text-sm font-bold text-white uppercase line-clamp-1 mt-2 mb-1">
                            {relP.name}
                          </h4>
                          <div className="text-lg font-bold text-[#BF8647] mb-3">
                            ${Number(relP.price).toFixed(2)}
                          </div>
                          <Link
                            href={`/products/${relP.slug}`}
                            className="block text-center border border-[#333] hover:border-[#BF8647] text-white hover:text-[#BF8647] text-xs font-bold uppercase py-2 rounded transition-colors"
                          >
                            View Tire Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
