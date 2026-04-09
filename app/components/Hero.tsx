'use client';

import React from 'react';
import SearchBar from './SearchBar';

const Hero = () => {
    return (
        <section className="relative w-full h-[90vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden pt-20">
            {/* Dynamic Background with Gradients instead of images to ensure performance & reliability */}
            <div className="absolute inset-0 bg-brand-cream :bg-brand-charcoal overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-brand-cream :to-brand-charcoal opacity-40"></div>

                {/* Bokeh Elements */}
                <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-brand-gold/15 blur-[100px] rounded-full animate-float opacity-50"></div>
                <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-brand-red/10 blur-[120px] rounded-full animate-float-slow opacity-40"></div>
                <div className="absolute top-[40%] right-[10%] w-[250px] h-[250px] bg-brand-gold/10 blur-[80px] rounded-full animate-float-reverse opacity-30"></div>
                <div className="absolute -bottom-[5%] left-[10%] w-[350px] h-[350px] bg-brand-cream :bg-zinc-800/20 blur-[90px] rounded-full animate-float-slow opacity-50"></div>

                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] bg-brand-gold/10 :bg-brand-gold/5 blur-[120px] rounded-full animate-zoom-in"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[60%] bg-brand-red/10 :bg-brand-red/5 blur-[120px] rounded-full animate-zoom-in stagger-2"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-brand-gold/20 bg-white/50 :bg-zinc-900/50 backdrop-blur-sm shadow-sm opacity-0 animate-fade-up">
                    <span className="text-xs font-semibold tracking-wider uppercase text-brand-gold">Discover Excellence</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-brand-charcoal :text-brand-cream mb-6 leading-[1] font-serif opacity-0 animate-fade-up stagger-1">
                    Experience Luxury <br /> <span className="text-brand-red italic opacity-90">Reimagined</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 :text-zinc-400 mb-12 leading-relaxed font-light tracking-wide opacity-0 animate-fade-up stagger-2">
                    Embark on a journey of refined elegance. Discover curated stays in the world&apos;s most breathtaking locations with HotelMate.
                </p>

                <div className="w-full max-w-5xl mx-auto opacity-0 animate-fade-up stagger-3">
                    <SearchBar />
                </div>
            </div>

            {/* Hero bottom scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400">
                    <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
