'use client';

import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScrollReveal from '@/app/components/ScrollReveal';

const AboutPage = () => {
    return (
        <div className="bg-brand-cream dark:bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop"
                        alt="Luxury Heritage"
                        className="absolute inset-0 w-full h-full object-cover animate-zoom-in brightness-50"
                    />
                    <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px]"></div>

                    <div className="container mx-auto px-6 relative z-10 text-center text-white">
                        <ScrollReveal className="animate-fade-up">
                            <span className="text-brand-gold font-bold uppercase tracking-[0.4em] text-xs mb-6 block">Est. 1924</span>
                            <h1 className="text-6xl md:text-9xl font-bold font-serif mb-8 uppercase tracking-tighter">A Century of <br /> Excellence</h1>
                            <p className="max-w-2xl mx-auto text-lg md:text-xl font-light italic text-brand-cream/80 leading-relaxed">
                                "To live is to wander, to wander well is to live truly."
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Our Philosophy */}
                <section className="py-32 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center overflow-hidden">
                    <ScrollReveal className="space-y-10">
                        <div>
                            <span className="text-brand-red font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Our Philosophy</span>
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-charcoal dark:text-brand-cream uppercase tracking-tight leading-none">The Art of <br /> Hospitality</h2>
                        </div>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                            At HotelMate, we believe that true luxury is not found in the material, but in the moments of
                            profound connection with oneself and the world.
                        </p>
                        <p className="text-zinc-500 dark:text-zinc-500 font-light leading-relaxed italic">
                            Founded on the principles of discretion, elegance, and soul, our collection represents
                            the pinnacle of human-centric design and world-class service.
                        </p>
                        <div className="pt-6">
                            <button className="px-10 py-4 bg-brand-charcoal dark:bg-brand-cream text-white dark:text-brand-charcoal rounded-full font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                Explore Our Values
                            </button>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal stagger={0.2} className="relative">
                        <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop"
                                alt="Hospitality Art"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-gold/10 blur-[80px] rounded-full animate-float -z-10"></div>
                    </ScrollReveal>
                </section>

                {/* The Collection Stats */}
                <section className="py-24 bg-brand-charcoal dark:bg-black text-white overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                            <ScrollReveal stagger={0.1} className="text-center space-y-2">
                                <div className="text-5xl md:text-7xl font-serif font-bold text-brand-gold">100+</div>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Years of Heritage</div>
                            </ScrollReveal>
                            <ScrollReveal stagger={0.2} className="text-center space-y-2">
                                <div className="text-5xl md:text-7xl font-serif font-bold text-brand-gold">50+</div>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Global Destinations</div>
                            </ScrollReveal>
                            <ScrollReveal stagger={0.3} className="text-center space-y-2">
                                <div className="text-5xl md:text-7xl font-serif font-bold text-brand-gold">5k+</div>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Curated Rooms</div>
                            </ScrollReveal>
                            <ScrollReveal stagger={0.4} className="text-center space-y-2">
                                <div className="text-5xl md:text-7xl font-serif font-bold text-brand-gold">24/7</div>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Global Concierge</div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Our Promise */}
                <section className="py-32 container mx-auto px-6 text-center max-w-4xl overflow-hidden">
                    <ScrollReveal>
                        <span className="text-brand-red font-bold uppercase tracking-[0.3em] text-[10px] mb-6 block">Our Promise</span>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-brand-charcoal dark:text-brand-cream uppercase mb-10 tracking-tight">An Unrivaled <br /> Experience</h2>
                        <p className="text-2xl font-light text-zinc-500 dark:text-zinc-400 italic leading-relaxed mb-16">
                            "Whether it's the high-altitude serenity of our Alpine lodges or the vibrant energy
                            of our urban retreats, we promise a sanctuary that feels like homecoming for the soul."
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ScrollReveal stagger={0.1} className="p-10 bg-white dark:bg-zinc-900 rounded-[2rem] border border-brand-gold/10 shadow-sm hover:shadow-xl transition-all">
                                <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-brand-charcoal dark:text-brand-cream uppercase tracking-widest text-sm mb-2">Security</h4>
                                <p className="text-xs text-zinc-500 font-light">Absolute privacy and peace of mind at every turn.</p>
                            </ScrollReveal>
                            <ScrollReveal stagger={0.2} className="p-10 bg-white dark:bg-zinc-900 rounded-[2rem] border border-brand-gold/10 shadow-sm hover:shadow-xl transition-all">
                                <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-brand-charcoal dark:text-brand-cream uppercase tracking-widest text-sm mb-2">Passion</h4>
                                <p className="text-xs text-zinc-500 font-light">Service born from a genuine love for hospitality.</p>
                            </ScrollReveal>
                            <ScrollReveal stagger={0.3} className="p-10 bg-white dark:bg-zinc-900 rounded-[2rem] border border-brand-gold/10 shadow-sm hover:shadow-xl transition-all">
                                <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-brand-charcoal dark:text-brand-cream uppercase tracking-widest text-sm mb-2">Discretion</h4>
                                <p className="text-xs text-zinc-500 font-light">Sophisticated service that is felt, never heard.</p>
                            </ScrollReveal>
                        </div>
                    </ScrollReveal>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
