'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme, resetTheme } from '@/store/slices/themeSlice';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const FONT_OPTIONS = {
    serif: [
        { label: 'Playfair Display', value: 'var(--font-playfair)', elite: true },
        { label: 'Cormorant Garamond', value: 'var(--font-cormorant)', elite: true },
        { label: 'EB Garamond', value: 'var(--font-eb-garamond)' },
        { label: 'Bodoni Moda', value: 'var(--font-bodoni)', elite: true },
        { label: 'Prata', value: 'var(--font-prata)' },
        { label: 'Lora', value: 'var(--font-lora)' },
        { label: 'Forum', value: 'var(--font-forum)' },
    ],
    sans: [
        { label: 'Geist Sans', value: 'var(--font-geist-sans)', elite: true },
        { label: 'Outfit', value: 'var(--font-outfit)', elite: true },
        { label: 'Inter', value: 'var(--font-inter)' },
        { label: 'Montserrat', value: 'var(--font-montserrat)' },
        { label: 'Poppins', value: 'var(--font-poppins)' },
        { label: 'Raleway', value: 'var(--font-raleway)' },
    ]
};

const FontPicker = ({ label, currentValue, onSelect }: { label: string, currentValue: string, onSelect: (val: string) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const allOptions = [...FONT_OPTIONS.serif, ...FONT_OPTIONS.sans];
    const filteredSerif = FONT_OPTIONS.serif.filter(f => f.label.toLowerCase().includes(search.toLowerCase()));
    const filteredSans = FONT_OPTIONS.sans.filter(f => f.label.toLowerCase().includes(search.toLowerCase()));
    const selected = allOptions.find(f => f.value === currentValue);

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white :bg-zinc-950 border border-zinc-100 :border-zinc-800 rounded-2xl group hover:border-brand-gold transition-all"
            >
                <div className="flex flex-col items-start translate-x-0 group-hover:translate-x-1 transition-transform text-brand-charcoal :text-brand-cream">
                    <span className="text-sm font-bold" style={{ fontFamily: currentValue }}>{selected?.label || 'Select Font'}</span>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-tighter">Current Typography</span>
                </div>
                <svg className={`w-4 h-4 text-zinc-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white :bg-zinc-900 border border-brand-gold/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-up">
                    <div className="p-3 border-b border-zinc-100 :border-zinc-800">
                        <input
                            type="text"
                            placeholder="Search fonts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full p-2 bg-zinc-50 :bg-zinc-950 rounded-xl text-xs focus:ring-1 focus:ring-brand-gold outline-none"
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-4">
                        {filteredSerif.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-3 py-1 text-[8px] font-black uppercase text-brand-gold tracking-[0.2em]">Serif / Luxury</div>
                                {filteredSerif.map(font => (
                                    <button
                                        key={font.value}
                                        onClick={() => { onSelect(font.value); setIsOpen(false); }}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${currentValue === font.value ? 'bg-brand-gold/10 text-brand-gold' : 'hover:bg-zinc-50 :hover:bg-zinc-800'}`}
                                    >
                                        <span className="text-base text-brand-charcoal :text-brand-cream" style={{ fontFamily: font.value }}>{font.label}</span>
                                        {font.elite && <span className="text-[7px] font-bold text-brand-gold border border-brand-gold/30 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase">Elite</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                        {filteredSans.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-3 py-1 text-[8px] font-black uppercase text-brand-gold tracking-[0.2em]">Sans / Modern</div>
                                {filteredSans.map(font => (
                                    <button
                                        key={font.value}
                                        onClick={() => { onSelect(font.value); setIsOpen(false); }}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${currentValue === font.value ? 'bg-brand-gold/10 text-brand-gold' : 'hover:bg-zinc-50 :hover:bg-zinc-800'}`}
                                    >
                                        <span className="text-sm font-medium text-brand-charcoal :text-brand-cream" style={{ fontFamily: font.value }}>{font.label}</span>
                                        {font.elite && <span className="text-[7px] font-bold text-brand-gold border border-brand-gold/30 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase">Elite</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsPage = () => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((state) => state.theme);

    const handleColorChange = (key: string, value: string) => {
        dispatch(setTheme({ [key]: value }));
    };

    const handleRadiusChange = (value: string) => {
        dispatch(setTheme({ borderRadius: `${value}px` }));
    };

    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white pb-20">
            <Header />

            <main className="pt-32 container mx-auto px-6 max-w-4xl">
                <div className="mb-12 animate-fade-up">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-charcoal :text-brand-cream mb-4 uppercase tracking-tight">Theme Settings</h1>
                    <p className="text-lg text-zinc-500 font-light italic">Customize the global aesthetic of your booking engine.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Controls */}
                    <div className="space-y-10 animate-fade-up stagger-1 opacity-0">
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-gold border-b border-brand-gold/20 pb-2">Color Palette</h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Primary Color (Red)</label>
                                    <input
                                        type="color"
                                        value={theme.primaryColor}
                                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Secondary Color (Gold)</label>
                                    <input
                                        type="color"
                                        value={theme.secondaryColor}
                                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Background Color (Cream)</label>
                                    <input
                                        type="color"
                                        value={theme.backgroundColor}
                                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Surface Color (Charcoal)</label>
                                    <input
                                        type="color"
                                        value={theme.surfaceColor}
                                        onChange={(e) => handleColorChange('surfaceColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-gold border-b border-brand-gold/20 pb-2">Layout & Shadow</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium">Border Radius</label>
                                        <span className="text-xs text-zinc-400">{theme.borderRadius}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="64"
                                        value={parseInt(theme.borderRadius)}
                                        onChange={(e) => handleRadiusChange(e.target.value)}
                                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-red"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium block">Shadow Presets</label>
                                    <div className="flex gap-4">
                                        {[
                                            { label: 'None', value: 'none' },
                                            { label: 'Low', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
                                            { label: 'Medium', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
                                            { label: 'High', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
                                        ].map((p) => (
                                            <button
                                                key={p.label}
                                                onClick={() => handleColorChange('shadowIntensity', p.value)}
                                                className={`px-4 py-2 text-xs rounded-full border transition-all ${theme.shadowIntensity === p.value ? 'bg-brand-red text-white border-brand-red' : 'border-zinc-200 hover:border-brand-gold'}`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-gold border-b border-brand-gold/20 pb-2">Typography</h2>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium block">Header Font</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Playfair', value: 'var(--font-playfair)' },
                                            { label: 'Cormorant', value: 'var(--font-cormorant)' },
                                            { label: 'Lora', value: 'var(--font-lora)' },
                                            { label: 'Geist Sans', value: 'var(--font-geist-sans)' }
                                        ].map((f) => (
                                            <button
                                                key={f.label}
                                                onClick={() => handleColorChange('headerFont', f.value)}
                                                className={`px-4 py-3 text-sm rounded-xl border transition-all text-left flex items-center justify-between ${theme.headerFont === f.value ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'border-zinc-100 :border-zinc-800 hover:border-brand-gold/50'}`}
                                                style={{ fontFamily: f.value }}
                                            >
                                                <span>{f.label}</span>
                                                {theme.headerFont === f.value && <div className="w-1.5 h-1.5 bg-brand-gold rounded-full"></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium block">Body Font</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Geist Sans', value: 'var(--font-geist-sans)' },
                                            { label: 'Inter', value: 'var(--font-inter)' },
                                            { label: 'Montserrat', value: 'var(--font-montserrat)' },
                                            { label: 'Lora', value: 'var(--font-lora)' }
                                        ].map((f) => (
                                            <button
                                                key={f.label}
                                                onClick={() => handleColorChange('bodyFont', f.value)}
                                                className={`px-4 py-3 text-sm rounded-xl border transition-all text-left flex items-center justify-between ${theme.bodyFont === f.value ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'border-zinc-100 :border-zinc-800 hover:border-brand-gold/50'}`}
                                                style={{ fontFamily: f.value }}
                                            >
                                                <span>{f.label}</span>
                                                {theme.bodyFont === f.value && <div className="w-1.5 h-1.5 bg-brand-gold rounded-full"></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => dispatch(resetTheme())}
                                className="px-8 py-4 border border-zinc-200 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all"
                            >
                                Reset Defaults
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="sticky top-32 h-fit bg-white :bg-zinc-900 border border-brand-gold/10 p-8 rounded-[var(--brand-radius)] shadow-[var(--brand-shadow)] animate-fade-up stagger-2 opacity-0">
                        <h3 className="text-xl font-serif font-bold mb-6 border-b border-zinc-100 :border-zinc-800 pb-4 uppercase tracking-tighter">Live Preview</h3>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="h-12 w-full bg-brand-red rounded-[var(--brand-radius)] flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-[var(--brand-shadow)]">Primary Component</div>
                                <div className="h-10 w-3/4 bg-brand-gold/20 rounded-[var(--brand-radius)] flex items-center justify-center text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em]">Secondary Style</div>
                            </div>

                            <div className="p-6 bg-brand-cream/50 :bg-black/20 rounded-[var(--brand-radius)] border border-brand-gold/10">
                                <h4 className="font-serif font-bold mb-2" style={{ color: theme.fontColor }}>Example Card</h4>
                                <p className="text-xs mb-4 font-light" style={{ color: theme.fontColor, opacity: 0.7 }}>See how your colors and shadows combine in real-time.</p>
                                <button className="w-full py-3 bg-brand-charcoal :bg-brand-cream text-white :text-brand-charcoal rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all">Action Button</button>
                            </div>

                            <div className="flex gap-2">
                                <span className="w-4 h-4 rounded-full bg-brand-red"></span>
                                <span className="w-4 h-4 rounded-full bg-brand-gold"></span>
                                <span className="w-4 h-4 rounded-full bg-brand-cream border border-zinc-100"></span>
                                <span className="w-4 h-4 rounded-full bg-brand-charcoal"></span>
                                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.fontColor }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SettingsPage;
