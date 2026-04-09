'use client';

import React, { use } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ScrollReveal from '@/app/components/ScrollReveal';
import { useAppSelector } from '@/store/hooks';

const LocationDetailPage = ({ params }: { params: Promise<{ name: string }> }) => {
    const { name } = use(params);
    const decodedName = decodeURIComponent(name);
    const { properties } = useAppSelector((state) => state.property);

    // Filter properties for this location (check city or country)
    const filteredProperties = properties.filter(p =>
        p.city.toLowerCase() === decodedName.toLowerCase() ||
        p.country.toLowerCase() === decodedName.toLowerCase()
    );

    if (filteredProperties.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream :bg-brand-charcoal text-brand-charcoal :text-brand-cream">
                <div className="text-center">
                    <h1 className="text-4xl font-serif mb-4">Location Not Found</h1>
                    <Link href="/locations" className="text-brand-red hover:underline font-medium italic">Explore Other Destinations</Link>
                </div>
            </div>
        );
    }

    const heroImage = filteredProperties[0].image;

    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white">
            <Header />

            <main>
                {/* Back Link */}
                <div className="container mx-auto px-6 py-6 absolute top-24 left-0 right-0 z-50">
                    <Link
                        href="/locations"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 group"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:-translate-x-1 transition-transform">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        All Destinations
                    </Link>
                </div>

                {/* Hero Section */}
                <section className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
                    <img
                        src={heroImage}
                        alt={decodedName}
                        className="w-full h-full object-cover animate-zoom-in scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 container mx-auto">
                        <ScrollReveal className="animate-fade-up">
                            <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Destination Portfolio</span>
                            <h1 className="text-5xl md:text-8xl font-bold text-white font-serif mb-2 uppercase tracking-tight">{decodedName}</h1>
                            <div className="flex items-center gap-4 text-brand-cream/80 font-light italic text-xl">
                                <span>{filteredProperties.length} Handpicked {filteredProperties.length === 1 ? 'Sanctuary' : 'Sanctuaries'}</span>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <div className="relative z-20 -mt-10 px-6 max-w-5xl mx-auto animate-fade-up">
                    <SearchBar />
                </div>

                <section className="py-24 container mx-auto px-6 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {filteredProperties.map((property, index) => (
                            <ScrollReveal
                                key={property.id}
                                stagger={index % 3 * 0.1}
                                className="group"
                            >
                                <Link
                                    href={`/hotels/${property.slug}`}
                                    className="block cursor-pointer"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-8 bg-zinc-100 :bg-zinc-900 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-2xl group-hover:-translate-y-4">
                                        <img
                                            src={property.image}
                                            alt={property.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 right-6 bg-white/90 :bg-brand-charcoal/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-brand-gold/20">
                                            <span className="text-sm font-bold text-brand-charcoal :text-brand-cream">{property.rating}</span>
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
                                            <h3 className="text-2xl font-bold text-brand-charcoal :text-brand-cream group-hover:text-brand-red transition-colors uppercase tracking-tight font-serif">{property.name}</h3>
                                            <span className="text-xl font-bold text-brand-red font-serif">{property.price}</span>
                                        </div>
                                        <p className="text-zinc-500 :text-zinc-400 text-sm font-light leading-relaxed line-clamp-2 italic">
                                            {property.description}
                                        </p>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LocationDetailPage;
