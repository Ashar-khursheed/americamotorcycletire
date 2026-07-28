import React from 'react';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { RepairServiceProtocol } from '@/components/RepairServiceProtocol';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { FeaturedTires } from '@/components/FeaturedTires';
import { CtaBanner } from '@/components/CtaBanner';
import { AboutBmg } from '@/components/AboutBmg';
import { ServiceProcess } from '@/components/ServiceProcess';
import { Testimonials } from '@/components/Testimonials';
import { FacilityGallery } from '@/components/FacilityGallery';
import { LocationContact } from '@/components/LocationContact';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white">
      {/* 1. Header */}
      <Header />

      {/* 2. Hero Banner */}
      <HeroBanner />

      {/* 3. Section 2: Repair & Service Protocol */}
      <RepairServiceProtocol />

      {/* 4. Section 3: Why Choose Us */}
      <WhyChooseUs />

      {/* 5. Section 4: Featured Tires */}
      <FeaturedTires />

      {/* 6. Section 5: Need New Tires CTA Banner */}
      <CtaBanner />

      {/* 7. Section 6: About BMG CYCLES */}
      <AboutBmg />

      {/* 8. Section 7: Our Service Process */}
      <ServiceProcess />

      {/* 9. Section 8: Testimonials */}
      <Testimonials />

      {/* 10. Section 9: Our Facility */}
      <FacilityGallery />

      {/* 11. Section 10: Location & Contact */}
      <LocationContact />

      {/* 12. Footer */}
      <Footer />
    </main>
  );
}
