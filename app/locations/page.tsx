'use client';

import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ScrollReveal from '@/app/components/ScrollReveal';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/hooks/useTranslation';

const LocationsPage = () => {
    const { properties, loading } = useAppSelector((state) => state.property);
    const { t } = useTranslation();

    // Extract unique countries and their cities
    const countryMap = properties.reduce((acc, property) => {
        const country = property.country;
        const city = property.city;

        if (!acc[country]) {
            acc[country] = {
                name: country,
                image: property.image, // Use first property's image as country hero
                cities: {}
            };
        }

        if (!acc[country].cities[city]) {
            acc[country].cities[city] = {
                name: city,
                image: property.image,
                propertyCount: 0,
                tags: new Set<string>()
            };
        }

        acc[country].cities[city].propertyCount += 1;
        property.tags.forEach(tag => acc[country].cities[city].tags.add(tag));
        return acc;
    }, {} as Record<string, { name: string, image: string, cities: Record<string, { name: string, image: string, propertyCount: number, tags: Set<string> }> }>);

    const countries = Object.values(countryMap);

    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-brand-gold/10 :bg-zinc-900 border-b border-brand-gold/10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <ScrollReveal className="animate-fade-up">
                            <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-xs mb-4 block animate-slide-down">{t('locations.globalPresence')}</span>
                            <h1 className="text-5xl md:text-7xl font-bold text-brand-charcoal :text-brand-cream font-serif mb-6 uppercase tracking-tight">{t('locations.ourDestinations')}</h1>
                            <p className="text-zinc-500 :text-zinc-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                                {t('locations.exploreDescription')}
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                <div className="relative z-20 -mt-10 px-6 max-w-5xl mx-auto animate-fade-up stagger-1">
                    <SearchBar />
                </div>

                <section className="py-24 container mx-auto px-6">
                    {countries.map((country, countryIndex) => (
                        <div key={country.name} className="mb-24 last:mb-0">
                            <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase tracking-tight mb-2">
                                        {country.name}
                                    </h2>
                                    <div className="h-1 w-20 bg-brand-red rounded-full"></div>
                                </div>
                                <p className="text-lg text-zinc-500 font-light italic">
                                    {t('locations.discoverCities', { count: Object.keys(country.cities).length, country: country.name })}
                                </p>
                            </ScrollReveal>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {Object.values(country.cities).map((city, cityIndex) => (
                                    <ScrollReveal
                                        key={city.name}
                                        stagger={(countryIndex * 0.1) + (cityIndex * 0.1)}
                                        className="group"
                                    >
                                        <Link
                                            href={`/locations/${encodeURIComponent(city.name)}`}
                                            className="relative h-[300px] block overflow-hidden rounded-[2rem] shadow-xl transition-all duration-700 hover:shadow-brand-gold/20"
                                        >
                                            <img
                                                src={city.image}
                                                alt={city.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/20 to-transparent opacity-70 group-hover:opacity-85 transition-opacity"></div>

                                            <div className="absolute inset-x-0 bottom-0 p-8">
                                                <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                    <h3 className="text-2xl md:text-3xl font-bold text-white font-serif mb-2 uppercase tracking-tight">{city.name}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-brand-cream/80 text-sm font-light italic">{city.propertyCount} {city.propertyCount === 1 ? t('locations.sanctuary') : t('locations.sanctuaries')}</p>
                                                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LocationsPage;
