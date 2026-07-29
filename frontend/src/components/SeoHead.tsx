'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface SeoHeadProps {
  slug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function SeoHead({ slug, fallbackTitle, fallbackDescription }: SeoHeadProps) {
  const [seo, setSeo] = useState<{
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_title?: string;
    og_description?: string;
    canonical_url?: string;
    allow_indexing?: boolean;
  }>({});

  useEffect(() => {
    let isMounted = true;
    const fetchSeo = async () => {
      try {
        const res = await api.get(`/pages/${slug}`);
        if (isMounted && res.data && res.data.meta_data) {
          setSeo(res.data.meta_data);
        }
      } catch (err) {
        // use fallbacks
      }
    };
    fetchSeo();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const title = seo.meta_title || fallbackTitle || `BMG CYCLES | ${slug.toUpperCase()}`;
  const description = seo.meta_description || fallbackDescription || 'Professional motorcycle repair, maintenance, and tire service.';
  const keywords = seo.meta_keywords || 'motorcycle tires, motorcycle repair, motorcycle service, Fremont CA';
  const ogTitle = seo.og_title || title;
  const ogDescription = seo.og_description || description;
  const robots = seo.allow_indexing === false ? 'noindex, nofollow' : 'index, follow';

  useEffect(() => {
    if (typeof window !== 'undefined' && title) {
      document.title = title;
    }
  }, [title]);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {seo.canonical_url && <link rel="canonical" href={seo.canonical_url} />}
    </>
  );
}
