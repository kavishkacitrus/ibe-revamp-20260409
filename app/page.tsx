'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ScrollReveal from '@/app/components/ScrollReveal';
import PromoToast from '@/app/components/PromoToast';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useSearchParams } from 'next/navigation';
import { setDestination } from '@/store/slices/bookingSlice';
import { useTranslation } from '@/hooks/useTranslation';

const PropertySkeleton = () => (
  <div className="animate-pulse">
    <div className="relative aspect-[4/5] bg-zinc-200 rounded-3xl mb-8"></div>
    <div className="space-y-3 px-2">
      <div className="flex items-start justify-between">
        <div className="h-8 bg-zinc-200 rounded-lg w-2/3"></div>
        <div className="h-8 bg-zinc-200 rounded-lg w-1/4"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-zinc-200 rounded-full"></div>
        <div className="h-4 bg-zinc-200 rounded-lg w-1/2"></div>
      </div>
    </div>
  </div>
);

const PropertiesContent = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const { properties, loading } = useAppSelector((state) => state.property);
  const { destination } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (searchParams.has('destination')) {
      const urlDest = searchParams.get('destination') || '';
      // Only update Redux from URL on initial load or URL change
      // Using a ref to prevent continuous overwrite if component re-renders
      dispatch(setDestination(urlDest));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredProperties = properties.filter(property => {
    if (!destination) return true;
    const searchTerms = destination.toLowerCase();
    const matchesLocation = property.location.toLowerCase().includes(searchTerms);
    const matchesName = property.name.toLowerCase().includes(searchTerms);
    return matchesLocation || matchesName;
  });

  return (
    <div className="bg-brand-cream min-h-screen selection:bg-brand-red selection:text-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-brand-charcoal">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-red/5 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4"></div>

          {/* <div className="container mx-auto px-6 relative z-10 text-center">
            <ScrollReveal className="animate-fade-up">
              <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-xs mb-4 block animate-slide-down">{t('home.curatedCollection')}</span>
              <h1 className="text-5xl md:text-7xl font-bold text-white font-serif mb-6 uppercase tracking-tight">{t('home.ourRetreats')}</h1>
              <p className="text-brand-cream/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                {t('home.discoverDescription')}
              </p>
            </ScrollReveal>
          </div> */}
        </section>

        <div className="relative z-20 -mt-10 px-6 max-w-5xl mx-auto animate-fade-up">
          <SearchBar />
        </div>

        <section className="py-24 container mx-auto px-6 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-brand-charcoal uppercase tracking-tight mb-4">{t('search.allDestinations')}</h2>
              <p className="text-lg text-zinc-500 font-light italic">
                {loading ? t('common.loading') : t('search.exploreDestinations', { count: filteredProperties.length })}
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Show 4 skeletons while loading
              [...Array(4)].map((_, i) => <PropertySkeleton key={i} />)
            ) : filteredProperties.length > 0 ? (
              filteredProperties.map((property, index) => (
                <ScrollReveal
                  key={property.id}
                  stagger={index % 3 * 0.1}
                  className="group"
                >
                  <Link
                    href={`/hotels/${property.slug}`}
                    className="block cursor-pointer"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-8 bg-zinc-100 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-2xl group-hover:-translate-y-4">
                      <img
                        src={property.image}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-brand-gold/20">
                        <span className="text-sm font-bold text-brand-charcoal">{property.rating}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-brand-gold">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                        {property.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-brand-charcoal/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3 px-2">
                      <div className="flex items-start justify-between">
                        <h3
                          className="text-2xl font-bold text-brand-charcoal transition-colors uppercase tracking-tight font-serif"
                          style={{ color: '#27272a' }} // Default zinc-800 roughly
                          onMouseOver={(e) => {
                            const parent = e.currentTarget.closest('.group');
                            if (parent) e.currentTarget.style.color = property.ibeHeaderColour || '#CC2229';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.color = '#27272a';
                          }}
                        >
                          {property.name}
                        </h3>
                        <span className="text-xl font-bold font-serif" style={{ color: property.ibeHeaderColour || '#CC2229' }}>{property.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-base font-medium font-light">{property.location}</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-xl text-zinc-500 font-light">{t('search.noResults')}</p>
                <button
                  onClick={() => dispatch(setDestination(''))}
                  className="mt-6 px-6 py-2 border border-brand-gold text-brand-gold rounded-full hover:bg-brand-gold/10 transition-colors"
                >
                  {t('common.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      {/* <PromoToast /> */}
    </div>
  );
};

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-cream :bg-brand-charcoal text-brand-gold">{t('common.loading')}</div>}>
      <PropertiesContent />
    </Suspense>
  );
}

