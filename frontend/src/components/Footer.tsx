'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSettings } from '@/lib/api';

export function Footer() {
  const [settings, setSettings] = useState<any>({
    site_name: 'BMG CYCLES',
    contact_phone: '408-591-8484',
    contact_email: 'tennis2016@yahoo.com',
    contact_address: '3541 YALE WAY FREMONT, CA 94538',
  });

  useEffect(() => {
    fetchSettings().then((res) => {
      if (res) setSettings((prev: any) => ({ ...prev, ...res }));
    });
  }, []);

  return (
    <footer suppressHydrationWarning className="bg-[#050505] text-gray-400 py-16 border-t border-[#1C1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-24 h-24 sm:w-36 sm:h-36  flex items-center justify-center overflow-hidden">
                <img src="/bmg-logo.webp" alt="BMG CYCLES FREMONT CA" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl sm:text-3xl tracking-wider text-white uppercase font-heading">
                  BMG <span className="text-[#BF8647]">CYCLES</span>
                </span>
                <span className="text-xs text-gray-400 tracking-widest uppercase font-bold">
                  FREMONT CA • REPAIR & SERVICE
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-gray-400 max-w-md pt-1">
              Premier motorcycle repair, tire fitment, and electronic wheel balancing center. Authorized dealer of Dunlop, Michelin, Pirelli, Bridgestone, and Metzeler tires.
            </p>
            <div className="text-xs text-[#BF8647] font-bold uppercase tracking-wider">
              📍 {settings.contact_address}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-[#BF8647] pl-2">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs font-semibold uppercase">
              <li>
                <Link href="/" className="hover:text-[#BF8647] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#BF8647] transition-colors">Shop Tires</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#BF8647] transition-colors">Repair & Service</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#BF8647] transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#BF8647] transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#BF8647] transition-colors">Order Lookup</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-[#BF8647] pl-2">
              CONTACT & HOURS
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="font-bold text-white uppercase">{settings.contact_phone}</li>
              <li className="text-gray-400 ">{settings.contact_email}</li>
              <li className="text-gray-500 pt-2">Mon - Sat: 9:00 AM - 6:00 PM</li>
              <li className="text-gray-500">Sunday: Closed</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#161616] text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {settings.site_name}. ALL RIGHTS RESERVED.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 uppercase text-[11px]">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/faqs" className="hover:text-[#BF8647] font-bold transition-colors">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
