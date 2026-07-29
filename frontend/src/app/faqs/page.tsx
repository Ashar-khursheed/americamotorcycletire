'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HelpCircle, ChevronDown, Wrench, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'TIRE FITMENT & SELECTION',
      iconType: 'wrench',
      question: 'How do I know which tire size fits my motorcycle?',
      answer: 'You can use our automated motorcycle fitment selector on the shop page by choosing your motorcycle Year, Make, and Model. Alternatively, check the sidewall of your existing tires or your owner manual for specs such as 120/70ZR17 (Front) or 180/55ZR17 (Rear).'
    },
    {
      category: 'SHIPPING & DISPATCH',
      iconType: 'truck',
      question: 'Do you offer free shipping on motorcycle tires?',
      answer: 'Yes! We offer FREE standard ground shipping on all orders over $99 within the contiguous United States. Orders under $99 ship at a low flat rate.'
    },
    {
      category: 'WORKSHOP & SERVICES',
      iconType: 'shield',
      question: 'Can I buy tires online and have them mounted at your Fremont shop?',
      answer: 'Absolutely! You can choose "In-Store Pickup & Service" during checkout or call us at 408-591-8484 to schedule professional tire mounting, high-speed computerized wheel balancing, and motorcycle brake inspection at our 3541 Yale Way location.'
    },
    {
      category: 'PAYMENTS & SECURITY',
      iconType: 'card',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), Stripe, Apple Pay, Google Pay, and Cash for in-person workshop pickups.'
    },
    {
      category: 'RETURNS & GUARANTEE',
      iconType: 'help',
      question: 'What is your return policy if I order the wrong size?',
      answer: 'Unused, unmounted tires in original condition can be returned or exchanged within 30 days of purchase. Just contact our customer support at 408-591-8484 or tennis2016@yahoo.com.'
    },
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'wrench': return <Wrench className="w-5 h-5 text-[#BF8647]" />;
      case 'truck': return <Truck className="w-5 h-5 text-[#BF8647]" />;
      case 'shield': return <ShieldCheck className="w-5 h-5 text-[#BF8647]" />;
      case 'card': return <CreditCard className="w-5 h-5 text-[#BF8647]" />;
      default: return <HelpCircle className="w-5 h-5 text-[#BF8647]" />;
    }
  };

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <SeoHead
        slug="faqs"
        fallbackTitle="Frequently Asked Questions | BMG CYCLES"
        fallbackDescription="Answers to common motorcycle tire, maintenance, and service questions."
      />
      <div>
        <Header />

        {/* Hero Banner */}
        <div className="bg-[#070707] border-b border-[#1A1A1A] py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-[#BF8647] font-bold text-xs uppercase tracking-widest block mb-2 font-heading">
              GOT QUESTIONS? WE HAVE ANSWERS
            </span>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wide font-heading text-white">
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-4">
              Everything you need to know about motorcycle tires, fitment lookup, shipping, and workshop service scheduling.
            </p>
          </div>
        </div>

        {/* Accordion FAQ Grid */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#0F0F0F] border border-[#1F1F1F] hover:border-[#BF8647]/50 rounded-xl overflow-hidden transition-all duration-300 shadow-xl"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(faq.iconType)}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#BF8647] block mb-0.5">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-bold uppercase font-heading text-white">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#BF8647]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-gray-300 text-sm leading-relaxed border-t border-[#181818] animate-in fade-in-50 duration-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {/* Direct Support CTA Card */}
          <div className="mt-12 bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2B2B2B] p-8 rounded-2xl text-center space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold uppercase font-heading text-white">
              STILL HAVE QUESTIONS ABOUT YOUR RIDE?
            </h3>
            <p className="text-gray-400 text-xs max-w-xl mx-auto">
              Our Fremont tire technicians are available Monday through Saturday to assist you with specs, fitment, and service bookings.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <a
                href="tel:408-591-8484"
                className="bg-[#BF8647] hover:bg-[#D49A50] text-black font-extrabold text-xs uppercase px-6 py-3 rounded-lg font-heading tracking-wider transition-all shadow-lg shadow-[#BF8647]/20"
              >
                CALL 408-591-8484
              </a>
              <a
                href="/contact"
                className="bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] hover:border-[#BF8647] text-white font-extrabold text-xs uppercase px-6 py-3 rounded-lg font-heading tracking-wider transition-all"
              >
                SCHEDULE SERVICE ONLINE
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
