'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Phone, Menu, X, User as UserIcon } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { CartDrawer } from './CartDrawer';
import { fetchSettings } from '@/lib/api';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
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
          <Link href="/" className="flex flex-col group">
            <span className="font-bold text-2xl tracking-wider text-white uppercase font-heading group-hover:text-gray-100 transition-colors">
              BMG <span className="text-[#BF8647]">CYCLES</span>
            </span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase font-heading">
              FREMONT CA • REPAIR & SERVICE
            </span>
          </Link>

          {/* Desktop Dynamic Nav */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-widest text-gray-300 uppercase font-heading">
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
                  className="relative py-1 hover:text-[#BF8647] transition-colors duration-200 group font-heading text-[13px] tracking-widest font-medium"
                >
                  <span className="font-heading tracking-widest">{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#BF8647] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ));
            })()}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">

            {/* Phone Button */}
            <a
              href={`tel:${settings.contact_phone}`}
              className="hidden lg:flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider bg-[#BF8647] text-black px-4 py-2.5 rounded-lg hover:bg-[#D49A50] hover:shadow-lg hover:shadow-[#BF8647]/30 hover:scale-105 transition-all duration-300 font-heading cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 fill-black" />
              <span>CALL {settings.contact_phone}</span>
            </a>

            {/* Customer Account Button */}
            {mounted && customerUser ? (
              <Link
                href="/account"
                className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#BF8647] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#BF8647] text-black font-extrabold flex items-center justify-center text-[11px]">
                  {customerUser.name ? customerUser.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <span className="hidden sm:inline line-clamp-1">{customerUser.name || 'Account'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#BF8647] font-bold uppercase py-1.5 px-2.5 rounded hover:bg-[#161616] transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#BF8647]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-300 hover:text-[#BF8647] hover:scale-110 transition-all duration-200 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {mounted && totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#BF8647] text-black font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-[#BF8647]/40 animate-pulse font-heading">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#121212] border-b border-[#222222] px-4 pt-2 pb-6 space-y-3 font-medium uppercase text-sm font-heading tracking-widest animate-in slide-in-from-top-2 duration-300">
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
                  className="block text-gray-300 hover:text-[#BF8647] py-1 transition-colors font-heading tracking-widest text-sm"
                >
                  <span className="font-heading tracking-widest">{item.label}</span>
                </Link>
              ));
            })()}
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
