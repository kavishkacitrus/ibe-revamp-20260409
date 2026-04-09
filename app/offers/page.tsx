'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import { offers, Offer } from '@/app/data/offers';
import ScrollReveal from '@/app/components/ScrollReveal';

const OffersPage = () => {
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-brand-red/5 :bg-zinc-900 border-b border-brand-red/10">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-red/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold/5 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4"></div>

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <ScrollReveal className="animate-fade-up">
                            <span className="text-brand-red font-bold uppercase tracking-[0.3em] text-xs mb-4 block animate-slide-down">Exclusive Privileges</span>
                            <h1 className="text-5xl md:text-7xl font-bold text-brand-charcoal :text-brand-cream font-serif mb-6 uppercase tracking-tight">Special Offers</h1>
                            <p className="text-zinc-600 :text-zinc-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                                Curated experiences and exclusive value for our most discerning guests.
                                Rediscover luxury with our seasonal packages and member-only rewards.
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                <div className="relative z-20 -mt-10 px-6 max-w-5xl mx-auto animate-fade-up">
                    <SearchBar />
                </div>

                <section className="py-24 container mx-auto px-6 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {offers.map((offer, index) => (
                            <ScrollReveal
                                key={offer.id}
                                stagger={index * 0.1}
                                className="group"
                            >
                                <div className="flex flex-col md:flex-row bg-white :bg-zinc-900 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                    <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                                        <img
                                            src={offer.image}
                                            alt={offer.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 left-6 bg-brand-red text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">
                                            {offer.discount}
                                        </div>
                                    </div>
                                    <div className="md:w-3/5 p-10 flex flex-col justify-between space-y-6">
                                        <div>
                                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-2 block">{offer.category}</span>
                                            <h3 className="text-3xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase mb-4 leading-tight">{offer.title}</h3>
                                            <p className="text-zinc-500 :text-zinc-400 font-light leading-relaxed">
                                                {offer.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col space-y-4 pt-4 border-t border-zinc-100 :border-zinc-800">
                                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                <span>Valid Until:</span>
                                                <span className="text-brand-charcoal :text-brand-cream">{offer.validUntil}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <button className="flex-1 py-4 bg-brand-charcoal :bg-brand-cream text-white :text-brand-charcoal rounded-full font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg text-xs">
                                                    Book This Offer
                                                </button>
                                                <button
                                                    onClick={() => setSelectedOffer(offer)}
                                                    className="px-6 py-4 border border-zinc-200 :border-zinc-800 rounded-full font-bold text-zinc-400 hover:text-brand-red :hover:text-brand-gold transition-colors text-xs uppercase tracking-widest"
                                                >
                                                    Terms
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            </main>

            {/* Terms Modal Overlay */}
            {selectedOffer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-brand-charcoal/40">
                    <div className="bg-white :bg-zinc-950 w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative animate-in zoom-in-95 fade-in duration-300">
                        <button
                            onClick={() => setSelectedOffer(null)}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full border border-zinc-100 :border-zinc-800 flex items-center justify-center hover:bg-zinc-50 :hover:bg-zinc-900 transition-all group"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="space-y-8">
                            <div>
                                <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2 block">Terms and Conditions</span>
                                <h3 className="text-4xl font-serif font-bold text-brand-charcoal :text-brand-cream uppercase">{selectedOffer.title}</h3>
                            </div>

                            <ul className="space-y-4">
                                {selectedOffer.terms.map((term, i) => (
                                    <li key={i} className="flex gap-4 text-zinc-500 :text-zinc-400 font-light leading-relaxed">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                                        <span>{term}</span>
                                    </li>
                                ))}
                            </ul>

                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-loose">
                                HotelMate reserves the right to modify or cancel this offer at any time without prior notice.
                                Subject to availability and regional restrictions.
                            </p>

                            <button
                                onClick={() => setSelectedOffer(null)}
                                className="w-full py-5 bg-brand-charcoal :bg-brand-cream text-white :text-brand-charcoal rounded-full font-bold uppercase tracking-widest shadow-xl"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default OffersPage;
