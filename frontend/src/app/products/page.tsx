'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchProducts, fetchCategories, fetchBrands, api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Search, Filter, ShoppingBag, Bike, Check, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { SeoHead } from '@/components/SeoHead';

function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage, setPerPage] = useState(50);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (searchParams) {
      const year = searchParams.get('year');
      const make = searchParams.get('make');
      const model = searchParams.get('model');
      const p = searchParams.get('page');

      if (year) setSelectedYear(year);
      if (make) setSelectedMake(make);
      if (model) setSelectedModel(model);
      if (p && !isNaN(Number(p)) && Number(p) > 0) {
        setCurrentPage(Number(p));
      }
    }
  }, [searchParams]);

  // Options State
  const [yearsList, setYearsList] = useState<string[]>([]);
  const [makesList, setMakesList] = useState<string[]>([]);
  const [modelsList, setModelsList] = useState<string[]>([]);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Dynamic dependent fitment options fetcher
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

          setYearsList(newYears);
          setMakesList(newMakes);
          setModelsList(newModels);

          if (selectedMake && !newMakes.includes(selectedMake)) {
            setSelectedMake('');
          }
          if (selectedModel && !newModels.includes(selectedModel)) {
            setSelectedModel('');
          }
        }
      }).catch(() => { });
  }, [selectedYear, selectedMake, selectedModel]);

  // Reset page to 1 when filters change (ignoring initial mount)
  const isFilterMounted = React.useRef(false);
  useEffect(() => {
    if (!isFilterMounted.current) {
      isFilterMounted.current = true;
      return;
    }
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('page');
      window.history.pushState({}, '', newUrl.toString());
    }
  }, [search, selectedCategory, selectedYear, selectedMake, selectedModel]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { page: currentPage };
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedYear) params.year = selectedYear;
    if (selectedMake) params.make = selectedMake;
    if (selectedModel) params.model = selectedModel;

    Promise.all([fetchProducts(params), fetchCategories()])
      .then(([prodRes, catRes]) => {
        if (prodRes) {
          const itemsList = Array.isArray(prodRes.data)
            ? prodRes.data
            : (Array.isArray(prodRes.data?.data) ? prodRes.data.data : (Array.isArray(prodRes) ? prodRes : []));
          setProducts(itemsList);

          const curPage = prodRes.current_page ?? prodRes.data?.current_page;
          const lPage = prodRes.last_page ?? prodRes.data?.last_page;
          const tot = prodRes.total ?? prodRes.data?.total;
          const pPage = prodRes.per_page ?? prodRes.data?.per_page;

          if (curPage !== undefined) setCurrentPage(curPage);
          if (lPage !== undefined) setLastPage(lPage);
          if (tot !== undefined) setTotalProducts(tot);
          if (pPage !== undefined) setPerPage(pPage);
        }

        if (catRes) setCategories(Array.isArray(catRes) ? catRes : []);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [currentPage, search, selectedCategory, selectedYear, selectedMake, selectedModel]);

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedYear('');
    setSelectedMake('');
    setSelectedModel('');
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('page');
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage && newPage !== currentPage) {
      setCurrentPage(newPage);
      
      if (typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('page', newPage.toString());
        window.history.pushState({}, '', newUrl.toString());
      }

      const catalogElement = document.getElementById('catalog-grid-section');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 250, behavior: 'smooth' });
      }
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

  const safeProducts = Array.isArray(products) ? products : [];
  const sortedProducts = [...safeProducts].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    return b.id - a.id;
  });

  const activeFilterCount = [selectedCategory, selectedYear, selectedMake, selectedModel, search].filter(Boolean).length;

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="products"
        fallbackTitle="Motorcycle Tires & Parts Catalog | BMG CYCLES"
        fallbackDescription="Browse high performance street, cruiser, touring, and racing motorcycle tires."
      />
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
                <Bike className="w-4 h-4" /> MOTORCYCLE FITMENT FILTER (YEAR / MAKE / MODEL)
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs uppercase font-semibold">
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

        {/* Products Grid Section */}
        <div id="catalog-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
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
            <>
              {/* Catalogue Summary Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-[#1F1F1F] pb-4">
                <div className="text-xs uppercase font-extrabold text-gray-400">
                  Showing <span className="text-white">{Math.min((currentPage - 1) * perPage + 1, totalProducts || sortedProducts.length)}</span> - <span className="text-white">{Math.min(currentPage * perPage, totalProducts || sortedProducts.length)}</span> of <span className="text-[#BF8647] font-black">{(totalProducts || sortedProducts.length).toLocaleString()}</span> Products
                  {lastPage > 1 && <span className="ml-2 text-gray-500 font-semibold">(Page {currentPage} of {lastPage})</span>}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#121212] border border-[#222] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#BF8647] transition-all group"
                  >
                    <Link href={`/products/${product.slug}`} className="relative bg-[#ffffff] p-6 h-64 flex items-center justify-center cursor-pointer block group">
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
                    </Link>

                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-base font-bold text-white uppercase line-clamp-2 mb-2 group-hover:text-[#BF8647] transition-colors cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                          {product.short_description || product.description}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-bold text-white">
                            ${(Number(product.price) || 0).toFixed(2)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${(Number(product.compare_at_price) || 0).toFixed(2)}
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

              {/* Pagination Controls Bar */}
              {lastPage > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414] border border-[#222] p-4 rounded-lg">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Showing <span className="text-[#BF8647] font-extrabold">{Math.min((currentPage - 1) * perPage + 1, totalProducts)}</span> to{' '}
                    <span className="text-[#BF8647] font-extrabold">{Math.min(currentPage * perPage, totalProducts)}</span> of{' '}
                    <span className="text-white font-extrabold">{totalProducts.toLocaleString()}</span> products
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Prev Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors flex items-center gap-1 text-xs font-bold uppercase px-3 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((num, idx) => (
                      <React.Fragment key={idx}>
                        {num === '...' ? (
                          <span className="px-2 py-1 text-gray-500 text-xs font-bold">...</span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(num as number)}
                            className={`min-w-[36px] h-[36px] px-3 py-1.5 rounded text-xs font-black uppercase transition-all cursor-pointer ${currentPage === num
                              ? 'bg-[#BF8647] text-black shadow-lg scale-105 font-black'
                              : 'bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647]'
                              }`}
                          >
                            {num}
                          </button>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === lastPage}
                      className="p-2 rounded bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors flex items-center gap-1 text-xs font-bold uppercase px-3 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(lastPage)}
                      disabled={currentPage === lastPage}
                      className="p-2 rounded bg-[#1A1A1A] border border-[#333] text-gray-300 hover:text-[#BF8647] hover:border-[#BF8647] disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:border-[#333] transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
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
