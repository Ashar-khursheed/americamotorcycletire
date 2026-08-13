'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Phone, Menu, X, User as UserIcon, Bike } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { CartDrawer } from './CartDrawer';
import { ShopYourRideDrawer } from './ShopYourRideDrawer';
import { fetchSettings } from '@/lib/api';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    site_name: 'BMG CYCLES',
    contact_phone: '408-591-8484',
    announcement_bar: 'FREE SHIPPING ON ORDERS OVER $99 | REPAIR & SERVICE SPECIALISTS',
  });

  const totalCount = useCartStore((state) => state.getTotalCount());

  useEffect(() => {
    setMounted(true);
    fetchSettings().then((data) => {
      if (data) setSettings((prev: any) => ({ ...prev, ...data }));
    });
    try {
      const stored = localStorage.getItem('bmg_customer_user');
      if (stored) setCustomerUser(JSON.parse(stored));
    } catch (e) {}
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div suppressHydrationWarning className="bg-[#BF8647] text-black text-xs font-bold uppercase tracking-wider py-1.5 px-4 text-center font-heading">
        {settings.announcement_bar || 'FREE SHIPPING ON ORDERS OVER $99 | REPAIR & SERVICE SPECIALISTS'}
      </div>

      {/* Main Header */}
      <header suppressHydrationWarning className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex flex-col group shrink-0">
            <span className="font-bold text-lg sm:text-2xl tracking-wider text-white uppercase font-heading group-hover:text-gray-100 transition-colors">
              BMG <span className="text-[#BF8647]">CYCLES</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 tracking-wider sm:tracking-widest uppercase font-heading">
              FREMONT CA • REPAIR & SERVICE
            </span>
          </Link>

          {/* Desktop Dynamic Nav with Tires Mega Menu */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-widest text-gray-300 uppercase font-heading">
            {(() => {
              let menuList = [
                { label: 'Home', url: '/' },
                { label: 'Shop Tires', url: '/products', isDropdown: true },
                { label: 'Repair & Service', url: '/services' },
                { label: 'About Us', url: '/about' },
                { label: 'Contact', url: '/contact' },
              ];
              if (settings.header_menu) {
                try {
                  const parsed = typeof settings.header_menu === 'string' ? JSON.parse(settings.header_menu) : settings.header_menu;
                  if (Array.isArray(parsed) && parsed.length > 0) menuList = parsed;
                } catch (e) { }
              }
              const bikeCategories = [
                { label: 'SPORTBIKE', desc: 'Hypersport & Street', url: '/products?bike_category=sportbike', img: '/images/categories/sportbike.png' },
                { label: 'CRUISER', desc: 'Harley-Davidson & Custom', url: '/products?bike_category=cruiser', img: '/images/categories/cruiser.png' },
                { label: 'DUAL SPORT', desc: 'Adventure & Enduro', url: '/products?bike_category=dualsport', img: '/images/categories/dualsport.png' },
                { label: 'TOURING', desc: 'Long Distance & Baggers', url: '/products?bike_category=touring', img: '/images/categories/touring.png' },
                { label: 'DIRT', desc: 'Motocross & MX Off-Road', url: '/products?bike_category=dirt', img: '/images/categories/dirt.png' },
                { label: 'RACE', desc: 'Track & Slick Performance', url: '/products?bike_category=race', img: '/images/categories/race.png' },
                { label: 'SCOOTER', desc: 'Urban Commuter & Moped', url: '/products?bike_category=scooter', img: '/images/categories/scooter.png' },
              ];

              return menuList.map((item: any, idx: number) => {
                const isTiresLink = item.label.toLowerCase().includes('tire') || item.isDropdown;
                if (isTiresLink) {
                  return (
                    <div key={idx} className="relative group">
                      <Link
                        href={item.url || '/products'}
                        className="py-6 inline-flex items-center gap-1 hover:text-[#BF8647] transition-colors duration-200 font-heading text-[13px] tracking-widest font-medium"
                      >
                        <span className="font-heading tracking-widest">{item.label}</span>
                        <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-[#BF8647] transition-all duration-300 group-hover:w-full"></span>
                      </Link>

                      {/* Dropdown Menu */}
                      <div className="absolute top-full left-0 w-80 bg-[#121212] border border-[#2B2B2B] rounded-xl shadow-2xl p-3 space-y-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-h-[480px] overflow-y-auto">
                        <div className="px-3 py-1.5 border-b border-[#222] mb-1">
                          <span className="text-[10px] font-black uppercase text-[#BF8647] tracking-widest block">
                            CYCLE GEAR TIRE CATEGORIES
                          </span>
                        </div>
                        {bikeCategories.map((cat, cIdx) => (
                          <Link
                            key={cIdx}
                            href={cat.url}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1A1A1A] hover:border-[#BF8647]/50 border border-transparent transition-all group/cat"
                          >
                            <div className="w-10 h-10 bg-[#EAEAEA] rounded p-1 flex items-center justify-center shrink-0">
                              <img src={cat.img} alt={cat.label} className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-black text-white group-hover/cat:text-[#BF8647] transition-colors tracking-wide">
                                {cat.label}
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium normal-case">
                                {cat.desc}
                              </div>
                            </div>
                          </Link>
                        ))}
                        <div className="pt-1 border-t border-[#222]">
                          <Link
                            href="/products"
                            className="block text-center text-[11px] font-bold uppercase text-gray-300 hover:text-[#BF8647] py-1.5 transition-colors"
                          >
                            VIEW ALL TIRES CATALOGUE &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={idx}
                    href={item.url || '/'}
                    className="relative py-1 hover:text-[#BF8647] transition-colors duration-200 group font-heading text-[13px] tracking-widest font-medium"
                  >
                    <span className="font-heading tracking-widest">{item.label}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#BF8647] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                );
              });
            })()}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* Shop Your Ride Button */}
            <button
              onClick={() => setIsVehicleDrawerOpen(true)}
              className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider bg-[#1F1912] text-[#BF8647] border border-[#BF8647]/60 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg hover:bg-[#BF8647] hover:text-black hover:shadow-lg hover:shadow-[#BF8647]/30 transition-all duration-300 font-heading cursor-pointer"
            >
              <Bike className="w-4 h-4" />
              <span className="hidden sm:inline">SHOP YOUR RIDE</span>
              <span className="inline sm:hidden text-[10px]">RIDE</span>
            </button>

            {/* Phone Button */}
            <a
              href={`tel:${settings.contact_phone}`}
              className="hidden lg:flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider bg-[#BF8647] text-black px-4 py-2 rounded-lg hover:bg-[#D49A50] hover:shadow-lg hover:shadow-[#BF8647]/30 hover:scale-105 transition-all duration-300 font-heading cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 fill-black" />
              <span>CALL {settings.contact_phone}</span>
            </a>

            {/* Customer Account Button */}
            {mounted && customerUser ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#BF8647] text-white text-xs font-bold uppercase px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#BF8647] text-black font-extrabold flex items-center justify-center text-[10px] sm:text-[11px]">
                  {customerUser.name ? customerUser.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <span className="hidden sm:inline line-clamp-1">{customerUser.name || 'Account'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-xs text-gray-300 hover:text-[#BF8647] font-bold uppercase py-1.5 px-2 sm:px-2.5 rounded hover:bg-[#161616] transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#BF8647]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 text-gray-300 hover:text-[#BF8647] hover:scale-110 transition-all duration-200 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {mounted && totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#BF8647] text-black font-extrabold text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md shadow-[#BF8647]/40 font-heading">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#121212] border-b border-[#222222] px-4 pt-3 pb-6 space-y-3 font-medium uppercase text-sm font-heading tracking-widest animate-in slide-in-from-top-2 duration-300">
            {/* Mobile Shop Your Ride Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsVehicleDrawerOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider bg-[#BF8647] text-black py-2.5 rounded-lg font-heading shadow-md"
            >
              <Bike className="w-4 h-4" />
              <span>SHOP YOUR RIDE (SELECT BIKE)</span>
            </button>

            {/* Mobile Bike Categories Section */}
            <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#262626] my-2 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#BF8647] tracking-widest block border-b border-[#2B2B2B] pb-1">
                TIRES BY BIKE CATEGORY
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/products?bike_category=sportbike"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#121212] p-2 rounded border border-[#333] text-white hover:border-[#BF8647] text-left font-bold"
                >
                  <div className="text-[11px] text-[#BF8647]">SPORTBIKE</div>
                  <div className="text-[9px] text-gray-400 font-normal lowercase">sport & race</div>
                </Link>
                <Link
                  href="/products?bike_category=cruiser"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#121212] p-2 rounded border border-[#333] text-white hover:border-[#BF8647] text-left font-bold"
                >
                  <div className="text-[11px] text-[#BF8647]">CRUISER</div>
                  <div className="text-[9px] text-gray-400 font-normal lowercase">harley & v-twin</div>
                </Link>
                <Link
                  href="/products?bike_category=touring"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#121212] p-2 rounded border border-[#333] text-white hover:border-[#BF8647] text-left font-bold"
                >
                  <div className="text-[11px] text-[#BF8647]">TOURING</div>
                  <div className="text-[9px] text-gray-400 font-normal lowercase">long distance</div>
                </Link>
                <Link
                  href="/products?bike_category=dirt"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#121212] p-2 rounded border border-[#333] text-white hover:border-[#BF8647] text-left font-bold"
                >
                  <div className="text-[11px] text-[#BF8647]">DIRT</div>
                  <div className="text-[9px] text-gray-400 font-normal lowercase">motocross & mx</div>
                </Link>
              </div>
            </div>

            {(() => {
              let menuList = [
                { label: 'Home', url: '/' },
                { label: 'Shop Tires', url: '/products' },
                { label: 'Repair & Service', url: '/services' },
                { label: 'About Us', url: '/about' },
                { label: 'Contact', url: '/contact' },
              ];
              if (settings.header_menu) {
                try {
                  const parsed = typeof settings.header_menu === 'string' ? JSON.parse(settings.header_menu) : settings.header_menu;
                  if (Array.isArray(parsed) && parsed.length > 0) menuList = parsed;
                } catch (e) { }
              }
              return menuList.map((item: any, idx: number) => (
                <Link
                  key={idx}
                  href={item.url || '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-[#BF8647] py-2 border-b border-[#1A1A1A] last:border-none transition-colors font-heading tracking-widest text-xs font-bold"
                >
                  <span className="font-heading tracking-widest">{item.label}</span>
                </Link>
              ));
            })()}

            {/* Mobile Contact Phone */}
            <a
              href={`tel:${settings.contact_phone}`}
              className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider border border-[#BF8647] text-[#BF8647] py-2.5 rounded-lg mt-2 font-heading"
            >
              <Phone className="w-4 h-4" />
              <span>CALL {settings.contact_phone}</span>
            </a>
          </div>
        )}
      </header>

      {/* Drawers */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ShopYourRideDrawer isOpen={isVehicleDrawerOpen} onClose={() => setIsVehicleDrawerOpen(false)} />
    </>
  );
}
