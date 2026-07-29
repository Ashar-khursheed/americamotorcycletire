'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Facebook, Instagram, Phone, Mail, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { SeoHead } from '@/components/SeoHead';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/contact', formData);
      if (res.data?.status === 'success') {
        setSuccessMsg(res.data.message || 'Your service inquiry has been submitted! We will contact you shortly.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit inquiry. Please call us directly at 408-591-8484.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="contact"
        fallbackTitle="Contact BMG CYCLES | Location & Hours"
        fallbackDescription="Visit BMG CYCLES in Fremont CA or call 408-591-8484 for motorcycle tire installation and repairs."
      />
      <div>
        <Header />

        {/* Hero Section */}
        <div className="relative bg-[#070707] py-24 sm:py-32 border-b border-[#1A1A1A] overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&auto=format&fit=crop"
              alt="Motorcycle Motion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black uppercase font-heading tracking-wider text-white">
              CONTACT US
            </h1>
          </div>
        </div>

        {/* Main Location & Form Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left Column: Location & Contact Specs */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2 font-heading">
                  COMMUNICATION LINK
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase font-heading text-white tracking-wide">
                  LOCATION & CONTACT
                </h2>
              </div>

              <div className="space-y-6 pt-4">
                {/* HQ Coordinates */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
                    HQ COORDINATES
                  </span>
                  <div className="text-xl sm:text-2xl font-black uppercase text-white font-heading tracking-wider">
                    3541 YALE WAY FREMONT, CA 94538
                  </div>
                </div>

                {/* Voice Link */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
                    VOICE LINK
                  </span>
                  <a
                    href="tel:408-591-8484"
                    className="text-xl sm:text-2xl font-black uppercase text-white font-heading tracking-wider hover:text-[#BF8647] transition-colors block"
                  >
                    408-591-8484
                  </a>
                </div>

                {/* Data Link */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
                    DATA LINK
                  </span>
                  <a
                    href="mailto:tennis2016@yahoo.com"
                    className="text-xl sm:text-2xl font-black text-white font-heading tracking-wider hover:text-[#BF8647] transition-colors block"
                  >
                    tennis2016@yahoo.com
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#BF8647] hover:bg-[#BF8647]/10 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#BF8647] hover:bg-[#BF8647]/10 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#BF8647] hover:bg-[#BF8647]/10 transition-all font-bold text-xs"
                  aria-label="TikTok"
                >
                  🎵
                </a>
              </div>
            </div>

            {/* Right Column: Schedule Service Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#050505] border border-[#1A1A1A] p-8 sm:p-12 rounded-2xl shadow-2xl shadow-black/80">
                <h3 className="text-3xl sm:text-4xl font-black uppercase font-heading text-center text-white tracking-wider mb-8">
                  SCHEDULE SERVICE
                </h3>

                {successMsg && (
                  <div className="mb-6 p-4 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="mb-6 p-4 rounded bg-red-950/80 border border-red-800 text-red-400 text-xs font-bold uppercase">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg px-4 py-3.5 text-white font-medium text-sm focus:outline-none focus:border-[#BF8647] transition-colors"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg px-4 py-3.5 text-white font-medium text-sm focus:outline-none focus:border-[#BF8647] transition-colors"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Phone No
                    </label>
                    <input
                      type="tel"
                      placeholder="Phone No"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg px-4 py-3.5 text-white font-medium text-sm focus:outline-none focus:border-[#BF8647] transition-colors"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg px-4 py-3.5 text-white font-medium text-sm focus:outline-none focus:border-[#BF8647] transition-colors normal-case"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#BF8647] hover:bg-[#D49A50] text-black font-black uppercase text-sm tracking-widest py-4 rounded-lg transition-all font-heading shadow-lg shadow-[#BF8647]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> SUBMITTING...
                      </>
                    ) : (
                      'SUBMIT NOW'
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
