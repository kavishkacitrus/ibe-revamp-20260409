'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useParams } from 'next/navigation';
import {
    setSelectedCurrency,
    fetchExchangeRate,
    selectSelectedCurrency,
    selectCurrencyLoading
} from '@/store/slices/currencySlice';
import {
    setSelectedLanguage,
    selectSelectedLanguage,
    selectLanguages
} from '@/store/slices/languageSlice';
import { useTranslation } from '@/hooks/useTranslation';

const Header = () => {
    const params = useParams();
    const { properties } = useAppSelector((state) => state.property);
    const { ratePlans } = useAppSelector((state) => state.ratePlan);
    const reservation = useAppSelector((state) => state.reservation);
    const selectedCurrency = useAppSelector(selectSelectedCurrency);
    const currencyLoading = useAppSelector(selectCurrencyLoading);
    const selectedLanguage = useAppSelector(selectSelectedLanguage);
    const languages = useAppSelector(selectLanguages);
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const currencyDropdownRef = useRef<HTMLDivElement>(null);
    const languageDropdownRef = useRef<HTMLDivElement>(null);

    // Common currencies
    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' }
    ];

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
                setIsCurrencyDropdownOpen(false);
            }
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
                setIsLanguageDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Identify active property from URL slug/id or reservation
    const slug = params.slug as string || params.id as string || reservation.items[0]?.hotelId;
    const property = properties.find(p => String(p.slug) === String(slug) || String(p.id) === String(slug));

    // Derive baseCurrency from the hotel's rate plans (the currency the prices are stored in)
    const propertyRatePlans = property?.id ? (ratePlans[property.id] || []) : [];
    const baseCurrency = propertyRatePlans.length > 0 ? propertyRatePlans[0].currencyCode : (property?.currencyCode || 'USD');

    const logoUrl = property?.ibE_LogoURL || "https://hotelmate-internal.s3.us-east-1.amazonaws.com/logo/hotelmate_logo_bwhite.png";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 md:px-12 backdrop-blur-md bg-transparent transition-all duration-500 animate-slide-down no-print">
            <div className="flex items-center gap-2">
                <Link href={property ? `/hotels/${property.slug}` : "/"} className="flex items-center gap-2">
                    <div
                        className="relative flex items-center"
                        style={{
                            height: property?.ibeLogoHeight ? `${property.ibeLogoHeight}px` : '40px',
                            minWidth: property?.ibeLogoWidth ? `${property.ibeLogoWidth}px` : '150px'
                        }}
                    >
                        <img
                            src={logoUrl}
                            alt={property?.name || "HotelMate"}
                            className="object-contain object-left :hidden"
                            style={{
                                height: '100%',
                                width: 'auto',
                                maxWidth: property?.ibeLogoWidth ? `${property.ibeLogoWidth}px` : '200px'
                            }}
                        />
                        <img
                            src={logoUrl}
                            alt={property?.name || "HotelMate"}
                            className="object-contain object-left hidden :block"
                            style={{
                                height: '100%',
                                width: 'auto',
                                maxWidth: property?.ibeLogoWidth ? `${property.ibeLogoWidth}px` : '200px'
                            }}
                        />
                    </div>
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 no-print">
                {/* <Link
                    href="/locations"
                    className="text-sm font-medium transition-colors"
                    style={{ color: '#52525b' }}
                    onMouseOver={(e) => (e.currentTarget.style.color = property?.ibeHeaderColour || '#CC2229')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#52525b')}
                >
                    Locations
                </Link> */}
                {/* <Link
                    href="/offers"
                    className="text-sm font-medium transition-colors"
                    style={{ color: '#52525b' }}
                    onMouseOver={(e) => (e.currentTarget.style.color = property?.ibeHeaderColour || '#CC2229')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#52525b')}
                >
                    Special Offers
                </Link>
                <Link
                    href="/about"
                    className="text-sm font-medium transition-colors"
                    style={{ color: '#52525b' }}
                    onMouseOver={(e) => (e.currentTarget.style.color = property?.ibeHeaderColour || '#CC2229')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#52525b')}
                >
                    About Us
                </Link> */}
            </nav>

            <div className="flex items-center gap-4 no-print">
                {/* Language Selector */}
                <div className="relative" ref={languageDropdownRef}>
                    <button
                        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                        className="text-sm font-medium px-4 py-2 text-zinc-700 :text-zinc-300 bg-white :bg-zinc-800 border border-zinc-300 :border-zinc-600 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                    >
                        <span>{languages.find(lang => lang.code === selectedLanguage)?.flag || '🌐'}</span>
                        <span className="hidden sm:inline">{languages.find(lang => lang.code === selectedLanguage)?.code.toUpperCase() || 'EN'}</span>
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                        >
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {isLanguageDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white :bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 :border-zinc-700 overflow-hidden z-50">
                            <div className="max-h-64 overflow-y-auto">
                                {languages.map((language) => (
                                    <button
                                        key={language.code}
                                        onClick={() => {
                                            dispatch(setSelectedLanguage(language.code));
                                            setIsLanguageDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 :hover:bg-zinc-800 transition-colors flex items-center justify-between ${
                                            selectedLanguage === language.code ? 'bg-zinc-100 :bg-zinc-800 text-brand-red' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{language.flag}</span>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-900 :text-zinc-100 font-medium">{language.nativeName}</span>
                                                <span className="text-xs text-zinc-500 :text-zinc-400">{language.name}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-zinc-500 :text-zinc-400 font-medium">{language.code.toUpperCase()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Currency Selector */}
                <div className="relative" ref={currencyDropdownRef}>
                    <button
                        onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                        className="text-sm font-medium px-4 py-2 text-zinc-700 :text-zinc-300 bg-white :bg-zinc-800 border border-zinc-300 :border-zinc-600 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                    >
                        {currencyLoading ? (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <>
                                <span>{currencies.find(c => c.code === selectedCurrency)?.symbol || selectedCurrency}</span>
                                <span>{selectedCurrency}</span>
                            </>
                        )}
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`transition-transform duration-200 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`}
                        >
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {isCurrencyDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white :bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 :border-zinc-700 overflow-hidden z-50">
                            <div className="max-h-64 overflow-y-auto">
                                {currencies.map((currency) => (
                                    <button
                                        key={currency.code}
                                        onClick={() => {
                                            dispatch(setSelectedCurrency(currency.code));
                                            setIsCurrencyDropdownOpen(false);
                                            if (currency.code !== baseCurrency) {
                                                dispatch(fetchExchangeRate({ baseCurrency, targetCurrency: currency.code }));
                                            }
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 :hover:bg-zinc-800 transition-colors flex items-center justify-between ${selectedCurrency === currency.code ? 'bg-zinc-100 :bg-zinc-800 text-brand-red' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{currency.symbol}</span>
                                            <span className="text-zinc-900 :text-zinc-100">{currency.code}</span>
                                        </div>
                                        <span className="text-xs text-zinc-500 :text-zinc-400">{currency.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Share Button */}
                <button
                    onClick={() => {
                        // Get property details from the page
                        const propertyName = document.querySelector('h1')?.textContent || 'Amazing Property';
                        const propertyLocation = document.querySelector('[data-property-location]')?.textContent || '';
                        const propertyDescription = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '';
                        
                        const shareData = {
                            title: propertyName,
                            text: `${propertyName}${propertyLocation ? ` in ${propertyLocation}` : ''} - ${propertyDescription}`,
                            url: window.location.href
                        };
                        
                        if (navigator.share) {
                            navigator.share(shareData);
                        } else {
                            // Fallback: copy to clipboard with property details
                            const shareText = `${shareData.title}\n${shareData.text}\n\n${shareData.url}`;
                            navigator.clipboard.writeText(shareText);
                            alert(`Property details copied to clipboard!\n\n${propertyName}`);
                        }
                    }}
                    className="w-10 h-10 text-zinc-700 :text-zinc-300 bg-white :bg-zinc-800 border border-zinc-300 :border-zinc-600 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center group"
                    aria-label="Share property"
                >
                    <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="group-hover:scale-110 transition-transform"
                    >
                        <path 
                            d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <path 
                            d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34385 15 6 15Z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <path 
                            d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <path 
                            d="M8.59006 13.51L15.4201 17.49" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <path 
                            d="M15.4201 6.51L8.59006 10.49" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;

