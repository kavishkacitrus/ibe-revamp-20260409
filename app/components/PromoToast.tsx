'use client';

import React, { useState, useEffect } from 'react';
import { offers, Offer } from '@/app/data/offers';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

const PromoToast = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (isDismissed) return;

        // Initial delay before showing the first promo
        const initialTimer = setTimeout(() => {
            setIsVisible(true);
        }, 8000);

        // Cycle through or hide logic
        const cycleInterval = setInterval(() => {
            if (!isDismissed) {
                setIsVisible(false);
                setTimeout(() => {
                    setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
                    setIsVisible(true);
                }, 1000); // 1s transition time
            }
        }, 25000); // Show every 25 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(cycleInterval);
        };
    }, [isDismissed]);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
    };

    if (isDismissed || !offers[currentOfferIndex]) return null;

    const currentOffer = offers[currentOfferIndex];

    return (
        <div
            className={`fixed bottom-8 right-0 md:right-8 z-[100] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform px-4 md:px-0 w-full md:w-[380px] ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'
                }`}
        >
            <div className="relative overflow-hidden bg-white/70 :bg-zinc-900/80 backdrop-blur-xl border border-brand-gold/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-1">
                {/* Background Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-gold/10 blur-2xl rounded-full"></div>

                <div className="relative p-5 flex gap-5">
                    {/* Offer Image */}
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-brand-gold/10">
                        <img
                            src={currentOffer.image}
                            alt={currentOffer.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-brand-charcoal/20"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles size={12} className="text-brand-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                                {currentOffer.category} Offer
                            </span>
                        </div>
                        <h4 className="text-sm font-bold font-serif text-brand-charcoal :text-brand-cream truncate uppercase tracking-tight mb-1">
                            {currentOffer.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-black text-brand-red bg-brand-red/10 px-2 py-0.5 rounded leading-none">
                                {currentOffer.discount}
                            </span>
                        </div>

                        <Link
                            href="/offers"
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal :text-brand-cream hover:text-brand-red :hover:text-brand-gold transition-colors"
                        >
                            Claim Now <ExternalLink size={10} />
                        </Link>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-1 hover:bg-zinc-100 :hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Loading Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-brand-gold/30 w-full origin-left animate-toast-progress"></div>
            </div>
        </div>
    );
};

export default PromoToast;
