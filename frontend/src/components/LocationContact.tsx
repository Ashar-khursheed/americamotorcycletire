'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { fetchSettings } from '@/lib/api';

export function LocationContact() {
  const [settings, setSettings] = useState<any>({
    contact_address: '39575 CHERRY ST, FREMONT, CA 94538',
    contact_phone: '408-591-8484',
    contact_email: 'INFO@BMGCYCLE.COM',
  });

  useEffect(() => {
    fetchSettings().then((res) => {
      if (res) setSettings((prev: any) => ({ ...prev, ...res }));
    });
  }, []);

  return (
    <section className="bg-[#0A0A0A] py-16 lg:py-24 border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Contact info */}
          <div>
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2">
              VISIT OUR FREMONT WORKSHOP
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mb-8">
              LOCATION & CONTACT
            </h2>

            <div className="space-y-6 text-gray-300">

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-[#161616] border border-[#262626] flex items-center justify-center text-[#BF8647] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-gray-400">ADDRESS</div>
                  <div className="text-white font-bold text-sm tracking-wider uppercase mt-0.5">
                    {settings.contact_address}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-[#161616] border border-[#262626] flex items-center justify-center text-[#BF8647] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-gray-400">PHONE</div>
                  <a href={`tel:${settings.contact_phone}`} className="text-white font-bold text-sm tracking-wider  mt-0.5 hover:text-[#BF8647]">
                    {settings.contact_phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-[#161616] border border-[#262626] flex items-center justify-center text-[#BF8647] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-gray-400">EMAIL</div>
                  <a href={`mailto:${settings.contact_email}`} className="text-white font-bold text-sm tracking-wider  mt-0.5 hover:text-[#BF8647]">
                    {settings.contact_email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-[#161616] border border-[#262626] flex items-center justify-center text-[#BF8647] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-gray-400">WORKSHOP HOURS</div>
                  <div className="text-white font-bold text-sm tracking-wider uppercase mt-0.5">
                    MON - SAT: 9:00 AM - 6:00 PM | SUN: CLOSED
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Google Map frame */}
          <div className="rounded-lg overflow-hidden border border-[#262626] shadow-2xl h-[380px] bg-[#141414]">
            <iframe
              title="BMG Cycles Location Map"
              src="https://maps.google.com/maps?q=39575+CHERRY+ST,+FREMONT,+CA+94538&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.8) contrast(1.2)' }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
