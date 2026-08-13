'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchProducts, fetchCategories, fetchBrands, api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import {
  Search,
  Filter,
  ShoppingBag,
  Bike,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Star,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { SeoHead } from '@/components/SeoHead';

function ProductsContent() {
  const searchParams = useSearchParams();

  const getInitialParam = (key: string) => searchParams?.get(key) || '';

  const initialYear = getInitialParam('year');
  const initialMake = getInitialParam('make');
  const initialModel = getInitialParam('model');
  const initialType = getInitialParam('type') || getInitialParam('vehicle_type') || getInitialParam('product_type');
  const initialVType = getInitialParam('vehicle_type') || getInitialParam('type');
  const initialBrand = getInitialParam('brand');
  const initialQ = getInitialParam('search');
  const initialBikeCategory = getInitialParam('bike_category');
  const initialPage = getInitialParam('page') ? Number(getInitialParam('page')) : 1;

  const [products, setProducts] = useState<any[]>([]);
  const [availableFilters, setAvailableFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Mobile Filter Drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage, setPerPage] = useState(24);

  // Filters State
  const [search, setSearch] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBikeCategory, setSelectedBikeCategory] = useState(initialBikeCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string[]>(initialVType ? initialVType.split(',') : []);
  const [selectedProductType, setSelectedProductType] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? initialBrand.split(',') : []);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMake, setSelectedMake] = useState(initialMake);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');
  const [brandSearch, setBrandSearch] = useState('');

  // Dependent Fitment Dropdown Lists
  const [yearsList, setYearsList] = useState<string[]>([]);
  const [makesList, setMakesList] = useState<string[]>([]);
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [typesList, setTypesList] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const addItem = useCartStore((state) => state.addItem);

  // Update state when searchParams change dynamically (e.g. client navigation)
  useEffect(() => {
    if (searchParams) {
      const year = searchParams.get('year') || '';
      const make = searchParams.get('make') || '';
      const model = searchParams.get('model') || '';
      const type = searchParams.get('type') || searchParams.get('vehicle_type') || searchParams.get('product_type') || '';
      const vType = searchParams.get('vehicle_type') || searchParams.get('type') || '';
      const brand = searchParams.get('brand') || '';
      const bikeCat = searchParams.get('bike_category') || '';
      const q = searchParams.get('search') || '';
      const p = searchParams.get('page');

      setSelectedYear(year);
      setSelectedMake(make);
      setSelectedModel(model);
      setSelectedType(type);
      setSelectedBikeCategory(bikeCat);
      setSelectedVehicleType(vType ? vType.split(',') : []);
      setSelectedBrands(brand ? brand.split(',') : []);
      setSearch(q);
      if (p && !isNaN(Number(p)) && Number(p) > 0) {
        setCurrentPage(Number(p));
      }
    }
  }, [searchParams]);

  // Fetch dynamic fitment options from backend when Type/Year/Make/Model change
  useEffect(() => {
    let isCurrent = true;
    const params: Record<string, string> = {};
    if (selectedType) params.type = selectedType;
    if (selectedYear) params.year = selectedYear;
    if (selectedMake) params.make = selectedMake;
    if (selectedModel) params.model = selectedModel;

    api
      .get('/fitments/options', { params })
      .then((res) => {
        if (!isCurrent) return;
        if (res.data) {
          setYearsList(res.data.years || []);
          setMakesList(res.data.makes || []);
          setModelsList(res.data.models || []);
          setTypesList(res.data.types || []);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [selectedType, selectedYear, selectedMake, selectedModel]);

  // Reset pagination on filter changes
  const isFilterMounted = React.useRef(false);
  useEffect(() => {
    if (!isFilterMounted.current) {
      isFilterMounted.current = true;
      return;
    }
    setCurrentPage(1);
  }, [
    search,
    selectedCategory,
    selectedBikeCategory,
    selectedType,
    selectedVehicleType,
    selectedProductType,
    selectedBrands,
    selectedYear,
    selectedMake,
    selectedModel,
    minPrice,
    maxPrice,
    minRating,
    sort,
  ]);

  // Fetch Products & Filters from API
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    const params: Record<string, any> = { page: currentPage, per_page: perPage, sort };

    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBikeCategory) params.bike_category = selectedBikeCategory;
    if (selectedType) params.type = selectedType;
    if (selectedVehicleType.length > 0) params.vehicle_type = selectedVehicleType.join(',');
    if (selectedProductType.length > 0) params.product_type = selectedProductType.join(',');
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
    if (selectedYear) params.year = selectedYear;
    if (selectedMake) params.make = selectedMake;
    if (selectedModel) params.model = selectedModel;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (minRating) params.min_rating = minRating;

    fetchProducts(params)
      .then((prodRes) => {
        if (!isCurrent) return;
        if (prodRes) {
          const itemsList = Array.isArray(prodRes.data)
            ? prodRes.data
            : Array.isArray(prodRes.data?.data)
            ? prodRes.data.data
            : Array.isArray(prodRes)
            ? prodRes
            : [];
          setProducts(itemsList);

          if (prodRes.available_filters) {
            setAvailableFilters(prodRes.available_filters);
          }
          if (prodRes.category_counts) {
            setCategoryCounts(prodRes.category_counts);
          }

          const curPage = prodRes.current_page ?? prodRes.data?.current_page;
          const lPage = prodRes.last_page ?? prodRes.data?.last_page;
          const tot = prodRes.total ?? prodRes.data?.total;
          const pPage = prodRes.per_page ?? prodRes.data?.per_page;

          if (curPage !== undefined) setCurrentPage(curPage);
          if (lPage !== undefined) setLastPage(lPage);
          if (tot !== undefined) setTotalProducts(tot);
          if (pPage !== undefined) setPerPage(pPage);
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error(err);
        setProducts([]);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [
    currentPage,
    perPage,
    search,
    selectedCategory,
    selectedBikeCategory,
    selectedType,
    selectedVehicleType,
    selectedProductType,
    selectedBrands,
    selectedYear,
    selectedMake,
    selectedModel,
    minPrice,
    maxPrice,
    minRating,
    sort,
  ]);

  const toggleBrand = (b: string) => {
    if (selectedBrands.includes(b)) {
      setSelectedBrands(selectedBrands.filter((item) => item !== b));
    } else {
      setSelectedBrands([...selectedBrands, b]);
    }
  };

  const toggleVehicleType = (vt: string) => {
    if (selectedVehicleType.includes(vt)) {
      setSelectedVehicleType(selectedVehicleType.filter((item) => item !== vt));
    } else {
      setSelectedVehicleType([...selectedVehicleType, vt]);
    }
  };

  const toggleProductType = (pt: string) => {
    if (selectedProductType.includes(pt)) {
      setSelectedProductType(selectedProductType.filter((item) => item !== pt));
    } else {
      setSelectedProductType([...selectedProductType, pt]);
    }
  };

  const handleBikeCategorySelect = (catId: string) => {
    setSelectedBikeCategory(catId);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      if (catId) {
        newUrl.searchParams.set('bike_category', catId);
      } else {
        newUrl.searchParams.delete('bike_category');
      }
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBikeCategory('');
    setSelectedType('');
    setSelectedVehicleType([]);
    setSelectedProductType([]);
    setSelectedBrands([]);
    setSelectedYear('');
    setSelectedMake('');
    setSelectedModel('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('newest');
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.search = '';
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (lastPage <= maxVisible + 2) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < lastPage) pages.push(i);
      }

      if (currentPage < lastPage - 2) pages.push('...');
      pages.push(lastPage);
    }
    return pages;
  };

  const isValidBrand = (b: any): boolean => {
    if (!b || typeof b !== 'string') return false;
    const cleaned = b.trim().toUpperCase();
    return (
      cleaned !== '' &&
      cleaned !== 'NAN' &&
      cleaned !== 'NULL' &&
      cleaned !== 'UNDEFINED' &&
      cleaned !== 'N/A' &&
      cleaned !== 'NONE'
    );
  };

  const rawBrandsList: string[] = availableFilters?.brands || [
    'Bridgestone',
    'Continental',
    'Dunlop',
    'Metzeler',
    'Michelin',
    'Pirelli',
    'Avon',
    'Shinko',
    'Kenda',
  ];

  const brandsList: string[] = rawBrandsList.filter(isValidBrand);

  const vehicleTypesList: string[] = availableFilters?.vehicle_types || [
    'Street',
    'Cruiser',
    'Dirt',
    'Adventure',
    'Scooter',
  ];

  const productTypesList: string[] = availableFilters?.product_types || [
    'Tires',
    'Hypersport',
    'Multi Compound',
    'Dual Sport',
    'Touring',
    'Inner Tubes',
  ];

  const filteredBrandsList = brandsList.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const activeFilterCount =
    [
      search,
      selectedCategory,
      selectedType,
      selectedYear,
      selectedMake,
      selectedModel,
      minPrice,
      maxPrice,
      minRating,
    ].filter(Boolean).length +
    selectedBrands.length +
    selectedVehicleType.length +
    selectedProductType.length;

  const renderFilterSidebarContent = (isDrawer = false) => (
    <div className="space-y-6 text-xs">
      {!isDrawer && (
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white">
            <Filter className="w-4 h-4 text-[#BF8647]" />
            <span>FILTER PRODUCTS</span>
          </div>
          <button
            onClick={resetAllFilters}
            className="text-[11px] text-gray-400 hover:text-[#BF8647] flex items-center gap-1 font-bold transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      )}

      {/* Brand Filter */}
      <div>
        <h4 className="font-extrabold uppercase text-[#BF8647] tracking-wider mb-2.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" /> BRANDS ({brandsList.length})
        </h4>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Filter brands..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#333] rounded px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-[#BF8647]"
          />
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {filteredBrandsList.map((brand) => {
            const isChecked = selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-[#333] bg-[#1A1A1A] text-[#BF8647] focus:ring-[#BF8647]"
                />
                <span className={`text-xs font-semibold ${isChecked ? 'text-[#BF8647] font-bold' : ''}`}>
                  {brand}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Vehicle Type Filter */}
      {vehicleTypesList.length > 0 && (
        <div className="border-t border-[#222] pt-4">
          <h4 className="font-extrabold uppercase text-[#BF8647] tracking-wider mb-2.5 flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5" /> VEHICLE TYPE
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {vehicleTypesList.map((vt) => {
              const isChecked = selectedVehicleType.includes(vt);
              return (
                <label
                  key={vt}
                  className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleVehicleType(vt)}
                    className="rounded border-[#333] bg-[#1A1A1A] text-[#BF8647] focus:ring-[#BF8647]"
                  />
                  <span className={`text-xs font-semibold ${isChecked ? 'text-[#BF8647] font-bold' : ''}`}>
                    {vt}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Type Filter */}
      {productTypesList.length > 0 && (
        <div className="border-t border-[#222] pt-4">
          <h4 className="font-extrabold uppercase text-[#BF8647] tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> SPECIFIC TYPE
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {productTypesList.map((pt) => {
              const isChecked = selectedProductType.includes(pt);
              return (
                <label
                  key={pt}
                  className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleProductType(pt)}
                    className="rounded border-[#333] bg-[#1A1A1A] text-[#BF8647] focus:ring-[#BF8647]"
                  />
                  <span className={`text-xs font-semibold ${isChecked ? 'text-[#BF8647] font-bold' : ''}`}>
                    {pt}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="border-t border-[#222] pt-4">
        <h4 className="font-extrabold uppercase text-[#BF8647] tracking-wider mb-2.5 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> PRICE RANGE ($)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#BF8647]"
          />
          <input
            type="number"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#333] rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#BF8647]"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="border-t border-[#222] pt-4">
        <h4 className="font-extrabold uppercase text-[#BF8647] tracking-wider mb-2.5 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-[#BF8647]" /> MINIMUM RATING
        </h4>
        <div className="space-y-1">
          {[
            { label: 'All Ratings', value: '' },
            { label: '4.5★ & Above', value: '4.5' },
            { label: '4.0★ & Above', value: '4.0' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setMinRating(r.value)}
              className={`w-full text-left px-2.5 py-1.5 rounded transition-colors flex items-center justify-between font-medium ${
                minRating === r.value
                  ? 'bg-[#BF8647] text-black font-bold'
                  : 'hover:bg-[#1F1F1F] text-gray-300'
              }`}
            >
              <span>{r.label}</span>
              {minRating === r.value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="products"
        fallbackTitle="Motorcycle Tires & Parts Catalog | America Motorcycle Tire"
        fallbackDescription="Browse 700+ high performance street, cruiser, touring, and off-road motorcycle tires with guaranteed vehicle fitment."
      />
      <div>
        <Header />

        {/* Page Header */}
        <div className="bg-[#121212] border-b border-[#1E1E1E] py-6 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[#BF8647] font-bold text-[10px] sm:text-xs uppercase tracking-widest block mb-1 sm:mb-2">
              AMERICA MOTORCYCLE TIRE • OFFICIAL INVENTORY CATALOGUE
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-white tracking-tight mb-4">
              MOTORCYCLE TIRES & SPECIFIC FITMENT CATALOG
            </h1>

            {/* Cycle Gear Style Visual Tire Category Selector (Always Visible) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#BF8647] flex items-center gap-1.5 font-heading">
                  <Sparkles className="w-3.5 h-3.5 text-[#BF8647]" /> SHOP BY TIRE CATEGORY
                </span>
                {selectedBikeCategory && (
                  <button
                    onClick={() => handleBikeCategorySelect('')}
                    className="text-[10px] text-gray-400 hover:text-[#BF8647] uppercase font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Show All Categories
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {[
                  {
                    id: 'sportbike',
                    label: 'Sportbike',
                    image: '/images/categories/sportbike.png',
                  },
                  {
                    id: 'cruiser',
                    label: 'Cruiser',
                    image: '/images/categories/cruiser.png',
                  },
                  {
                    id: 'dirt',
                    label: 'Dirt',
                    image: '/images/categories/dirt.png',
                  },
                  {
                    id: 'race',
                    label: 'Race',
                    image: '/images/categories/race.png',
                  },
                ].map((cat) => {
                  const isActive = selectedBikeCategory.toLowerCase() === cat.id.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleBikeCategorySelect(cat.id)}
                      className={`group flex flex-col items-center justify-between bg-[#161616] p-2 sm:p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'border-[#BF8647] ring-2 ring-[#BF8647]/60 shadow-lg shadow-[#BF8647]/30 scale-[1.04]'
                          : 'border-[#262626] hover:border-[#BF8647]/60 hover:bg-[#1C1C1C]'
                      }`}
                    >
                      {/* Cycle Gear Style White/Grey Image Frame */}
                      <div className="w-full h-24 sm:h-28 bg-[#EAEAEA] rounded-lg p-1.5 flex items-center justify-center overflow-hidden relative shadow-inner">
                        {/* Category Count Badge */}
                        <div className="absolute top-1.5 left-1.5 z-10 bg-black/85 backdrop-blur-md text-[#BF8647] text-[10px] font-black px-2 py-0.5 rounded border border-[#BF8647]/50 shadow flex items-center gap-1">
                          <span>{categoryCounts[cat.id] ?? 0}</span>
                          <span className="text-[8px] text-gray-300 font-bold uppercase tracking-wider">TIRES</span>
                        </div>

                        <img
                          src={cat.image}
                          alt={cat.label}
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        {isActive && (
                          <div className="absolute top-1 right-1 z-10 bg-[#BF8647] text-black p-0.5 rounded-full shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Label Text & Count below */}
                      <div className="mt-2 text-center w-full">
                        <span
                          className={`text-xs font-black uppercase font-heading tracking-wide block transition-colors ${
                            isActive ? 'text-[#BF8647]' : 'text-white group-hover:text-[#BF8647]'
                          }`}
                        >
                          {cat.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-wider block mt-0.5">
                          {categoryCounts[cat.id] ?? 0} Products
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top Fitment & Search Toolbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
          {/* Bike Fitment Search Box (Only displayed when fitment parameters exist) */}
          {(selectedYear || selectedMake || selectedModel || selectedType) && (
            <div className="bg-[#141414] border border-[#BF8647]/40 p-3.5 sm:p-5 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-2.5">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-extrabold text-[#BF8647] uppercase tracking-wider">
                  <Bike className="w-4 h-4 shrink-0" /> BIKE FITMENT SEARCH
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[10px] sm:text-[11px] text-gray-400 hover:text-[#BF8647] uppercase font-bold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Filters ({activeFilterCount})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs uppercase font-semibold">
                {/* Type */}
                <div>
                  <label className="text-[9px] sm:text-[10px] text-gray-400 font-bold block mb-1">TYPE / CATEGORY</label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setSelectedYear('');
                      setSelectedMake('');
                      setSelectedModel('');
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white focus:border-[#BF8647] focus:outline-none"
                  >
                    <option value="">ALL TYPES</option>
                    {(typesList.length > 0 ? typesList : ['Street Bike', 'Dirt Bike', 'UTV/ATV'])
                      .filter((t) => ['Street Bike', 'Dirt Bike', 'Dirt', 'UTV/ATV', 'Street'].includes(t))
                      .map((t) => (
                        <option key={t} value={t}>
                          {t.toLowerCase().includes('dirt') ? 'Dirt Bike' : t.toLowerCase().includes('street') ? 'Street Bike' : t}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-[9px] sm:text-[10px] text-gray-400 font-bold block mb-1">YEAR</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMake('');
                      setSelectedModel('');
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white focus:border-[#BF8647] focus:outline-none"
                  >
                    <option value="">ALL YEARS</option>
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Make */}
                <div>
                  <label className="text-[9px] sm:text-[10px] text-gray-400 font-bold block mb-1">MAKE</label>
                  <select
                    value={selectedMake}
                    onChange={(e) => {
                      setSelectedMake(e.target.value);
                      setSelectedModel('');
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white focus:border-[#BF8647] focus:outline-none"
                  >
                    <option value="">ALL MAKES</option>
                    {makesList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="text-[9px] sm:text-[10px] text-gray-400 font-bold block mb-1">MODEL</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white focus:border-[#BF8647] focus:outline-none"
                  >
                    <option value="">ALL MODELS</option>
                    {modelsList.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Search & Sort Row */}
          <div className="bg-[#141414] border border-[#222] p-3.5 sm:p-4 rounded-xl flex flex-col lg:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Part Number (e.g. 0201-2382), SKU, Brand, or Tire Size..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#BF8647]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-[#BF8647] text-black font-extrabold uppercase text-xs py-2.5 px-3 rounded-lg shadow-md hover:bg-[#D49A50] transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>FILTERS</span>
                {activeFilterCount > 0 && (
                  <span className="bg-black text-[#BF8647] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="flex-1 lg:w-48 bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#BF8647] uppercase font-bold"
              >
                <option value="newest">SORT BY: NEWEST</option>
                <option value="price_asc">PRICE: LOW TO HIGH</option>
                <option value="price_desc">PRICE: HIGH TO LOW</option>
                <option value="rating_desc">HIGHEST RATED</option>
                <option value="name_asc">NAME: A TO Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer Sidebar */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Overlay */}
            <div
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />

            {/* Drawer Sidebar */}
            <div className="relative z-50 w-full max-w-xs sm:max-w-sm bg-[#121212] border-r border-[#222] h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300">
              {/* Header */}
              <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#171717]">
                <div className="flex items-center gap-2 font-black uppercase text-sm text-white">
                  <Filter className="w-4 h-4 text-[#BF8647]" />
                  <span>FILTER PRODUCTS</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-[#BF8647] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetAllFilters}
                      className="text-[11px] text-gray-400 hover:text-[#BF8647] font-bold uppercase flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#222]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto flex-grow space-y-6">
                {renderFilterSidebarContent(true)}
              </div>

              {/* Footer Apply Button */}
              <div className="p-4 border-t border-[#222] bg-[#171717]">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-[#BF8647] text-black font-extrabold uppercase py-3 rounded-lg text-xs tracking-wider hover:bg-[#D49A50] transition-colors shadow-lg"
                >
                  SHOW RESULTS ({(totalProducts || products.length).toLocaleString()})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Desktop Left Sidebar Filters (hidden on mobile) */}
            <aside className="hidden lg:block lg:col-span-1 bg-[#121212] border border-[#222] rounded-xl p-5 space-y-6 text-xs sticky top-24 self-start">
              {renderFilterSidebarContent(false)}
            </aside>

            {/* Right Products Catalog Grid */}
            <div className="lg:col-span-3 space-y-6">
              {/* Catalogue Summary Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-4">
                <div className="text-[11px] sm:text-xs uppercase font-extrabold text-gray-400">
                  Showing{' '}
                  <span className="text-white">
                    {Math.min((currentPage - 1) * perPage + 1, totalProducts || products.length)}
                  </span>{' '}
                  -{' '}
                  <span className="text-white">
                    {Math.min(currentPage * perPage, totalProducts || products.length)}
                  </span>{' '}
                  of <span className="text-[#BF8647] font-black">{(totalProducts || products.length).toLocaleString()}</span>{' '}
                  Products
                  {lastPage > 1 && (
                    <span className="ml-2 text-gray-500 font-semibold">(Page {currentPage} of {lastPage})</span>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <ProductCardSkeleton key={idx} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 sm:py-20 text-gray-500 bg-[#121212] rounded-xl border border-[#222] p-6 sm:p-8">
                  <p className="text-base sm:text-lg font-bold uppercase text-white mb-2">No products match your filter criteria.</p>
                  <p className="text-xs text-gray-400 mb-6">
                    Try clearing your search terms or expanding your Year, Make, Model, or Brand selection.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="bg-[#BF8647] text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#D49A50] transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product) => {
                      const numPrice = Number(product.price) || 0;
                      const numWasPrice = Number(product.was_price || product.compare_at_price) || 0;
                      const hasDiscount = numWasPrice > numPrice;
                      const numRating = typeof product.rating === 'number' ? product.rating : (parseFloat(String(product.rating || '0')) || 0);

                      return (
                        <div
                          key={product.id}
                          className="bg-[#121212] border border-[#222] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#BF8647] transition-all group shadow-md hover:shadow-xl"
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="relative bg-[#ffffff] p-4 sm:p-6 h-48 sm:h-60 flex items-center justify-center cursor-pointer block group"
                          >
                            <img
                              src={
                                product.primary_image ||
                                'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop'
                              }
                              alt={product.name}
                              className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />

                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                              {isValidBrand(product.brand) && (
                                <span className="bg-[#BF8647] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                                  {product.brand}
                                </span>
                              )}
                              {product.vehicle_type && (
                                <span className="bg-[#1F1F1F] text-gray-300 text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-[#333]">
                                  {product.vehicle_type}
                                </span>
                              )}
                            </div>

                            {hasDiscount && (
                              <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                                SALE
                              </span>
                            )}
                          </Link>

                          <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3 sm:space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 mb-1.5">
                                <span className="font-mono text-[9px] sm:text-[10px] bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-[#262626]">
                                  ITEM #: {product.item_number || product.sku}
                                </span>
                                {numRating > 0 && (
                                  <div className="flex items-center gap-1 text-[#BF8647] font-bold">
                                    <Star className="w-3 h-3 fill-[#BF8647]" />
                                    <span>{numRating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-[9px] sm:text-[10px]">({product.review_count || 12})</span>
                                  </div>
                                )}
                              </div>

                              <Link href={`/products/${product.slug}`}>
                                <h3 className="text-xs sm:text-sm font-bold text-white uppercase line-clamp-2 leading-snug group-hover:text-[#BF8647] transition-colors cursor-pointer mb-1.5">
                                  {product.name}
                                </h3>
                              </Link>

                              <p className="text-gray-400 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                                {product.specs_and_features || product.description}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-baseline gap-2 mb-2.5">
                                <span className="text-xl sm:text-2xl font-black text-white">${numPrice.toFixed(2)}</span>
                                {hasDiscount && (
                                  <span className="text-[11px] sm:text-xs text-gray-500 line-through">
                                    ${numWasPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 uppercase text-[11px] sm:text-xs font-bold">
                                <button
                                  onClick={() => addItem(product, 1)}
                                  className="bg-[#BF8647] text-black py-2 px-1 rounded-lg hover:bg-[#D49A50] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" /> Add
                                </button>
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="border border-[#333] text-white py-2 px-1 rounded-lg hover:border-[#BF8647] hover:text-[#BF8647] transition-colors text-center flex items-center justify-center cursor-pointer"
                                >
                                  Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls Bar */}
                  {lastPage > 1 && (
                    <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414] border border-[#222] p-3.5 sm:p-4 rounded-xl">
                      <div className="text-[11px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider text-center sm:text-left">
                        Page <span className="text-[#BF8647] font-extrabold">{currentPage}</span> of{' '}
                        <span className="text-white font-extrabold">{lastPage}</span> (
                        <span className="text-white font-extrabold">{totalProducts.toLocaleString()}</span> products)
                      </div>

                      {/* Desktop Full Pagination */}
                      <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-center">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors cursor-pointer disabled:cursor-not-allowed"
                          title="First Page"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors flex items-center gap-1 text-xs font-bold uppercase px-3 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" /> Prev
                        </button>

                        {getPageNumbers().map((num, idx) => (
                          <React.Fragment key={idx}>
                            {num === '...' ? (
                              <span className="px-2 py-1 text-gray-500 text-xs font-bold">...</span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(num as number)}
                                className={`min-w-[36px] h-[36px] px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                                  currentPage === num
                                    ? 'bg-[#BF8647] text-black shadow-lg scale-105 font-black'
                                    : 'bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647]'
                                }`}
                              >
                                {num}
                              </button>
                            )}
                          </React.Fragment>
                        ))}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === lastPage}
                          className="p-2 rounded-lg bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors flex items-center gap-1 text-xs font-bold uppercase px-3 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handlePageChange(lastPage)}
                          disabled={currentPage === lastPage}
                          className="p-2 rounded-lg bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors cursor-pointer disabled:cursor-not-allowed"
                          title="Last Page"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mobile Compact Pagination */}
                      <div className="flex sm:hidden items-center justify-between w-full gap-2 pt-2 border-t border-[#222]">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-bold uppercase"
                        >
                          <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        <span className="text-xs font-bold text-white px-2">
                          {currentPage} / {lastPage}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === lastPage}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-bold uppercase"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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
