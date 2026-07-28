'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Enable browser native scroll restoration for Back/Forward navigation
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }, []);

  useEffect(() => {
    // Scroll to top on fresh page navigation
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
