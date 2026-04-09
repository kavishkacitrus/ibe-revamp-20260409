'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScrollReveal from '@/app/components/ScrollReveal';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCustomerInfo, setCurrency, removeRoom } from '@/store/slices/reservationSlice';
import { selectSelectedCurrency } from '@/store/slices/currencySlice';
import { useTranslation } from '@/hooks/useTranslation';
import { usePromoCode } from '@/hooks/usePromoCode';
import { getCurrencySymbol } from '@/utils/currency';

const CheckoutPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const reservation = useAppSelector((state) => state.reservation);
    const { properties, propertyRooms } = useAppSelector((state) => state.property);
    const { checkIn, checkOut, guests } = useAppSelector((state) => state.booking);
    const selectedCurrency = useAppSelector(selectSelectedCurrency);
    const exchangeRates = useAppSelector((state) => state.currency.exchangeRates);
    const { t } = useTranslation();
    const isHeadless = searchParams?.get('headless') === 'true';
    const {
        currentPromoCode,
        validationError,
        isValidating,
        appliedPromoCode,
        hasValidPromo,
        promoDiscount,
        validatePromo,
        clearCurrentPromo,
        clearValidationErr,
        setApplied,
    } = usePromoCode();

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: '',
        estimatedArrivalTime: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [promoCode, setPromoCode] = useState('');
    
    // Tooltip/Popup state for terms checkbox
    const [showTermsAlert, setShowTermsAlert] = useState(false);
    
    // Validation state
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    // Validation functions
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'firstName':
                if (!value.trim()) return t('errors.required');
                if (value.trim().length < 2) return t('errors.minLength').replace('{{count}}', '2');
                if (!/^[a-zA-Z\s'-]+$/.test(value)) return t('errors.invalid');
                return '';
            
            case 'lastName':
                if (!value.trim()) return t('errors.required');
                if (value.trim().length < 2) return t('errors.minLength').replace('{{count}}', '2');
                if (!/^[a-zA-Z\s'-]+$/.test(value)) return t('errors.invalid');
                return '';
            
            case 'email':
                if (!value.trim()) return t('errors.required');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return t('errors.invalidEmail');
                return '';
            
            default:
                return '';
        }
    };

    const validateForm = (): boolean => {
        const newErrors = {
            firstName: validateField('firstName', formData.firstName),
            lastName: validateField('lastName', formData.lastName),
            email: validateField('email', formData.email)
        };
        
        setErrors(newErrors);
        
        return !Object.values(newErrors).some(error => error !== '');
    };

    const firstItem = reservation.items[0];
    const hotelId = firstItem?.hotelId;
    const property = properties.find(p => p.id === hotelId);
    const otherRooms = (propertyRooms[hotelId] || []).filter(room =>
        !reservation.items.some(item => item.name === room.name) && room.availableCount > 0
    ).slice(0, 3);

    // Currency conversion logic
    const baseCurrency = reservation.currency || 'USD';
    const rateKey = `${baseCurrency}_${selectedCurrency}`;
    const exchangeRate = exchangeRates[rateKey];
    const displayCurrency = (selectedCurrency !== baseCurrency && exchangeRate) ? selectedCurrency : baseCurrency;
    const convertPrice = (price: number) => {
        if (selectedCurrency === baseCurrency || !exchangeRate) return Math.round(price);
        return Math.round(price * exchangeRate.rate);
    };

    // Calculate total with discount
    const totalAmount = reservation.totalAmount;
    const discountAmount = hasValidPromo && promoDiscount ? Math.round((totalAmount * promoDiscount) / 100) : 0;
    const finalTotal = totalAmount - discountAmount;

    useEffect(() => {
        if (reservation.items.length === 0) {
            router.push('/');
        }
    }, [reservation.items, router]);

    // Auto-hide terms alert after 5 seconds
    useEffect(() => {
        if (showTermsAlert) {
            const timer = setTimeout(() => {
                setShowTermsAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showTermsAlert]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Validate field on change (excluding phone and special requests)
        if (name !== 'specialRequests' && name !== 'phone') {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handlePayment = () => {
        // First check if terms are agreed
        if (!agreedToTerms) {
            // Show alert near checkbox
            setShowTermsAlert(true);
            
            // Scroll to the terms checkbox with smooth animation
            // Get the checkbox container (the label element)
            const termsLabel = document.querySelector('label.flex.items-start.gap-4.cursor-pointer');
            const termsCheckbox = document.querySelector('input[type="checkbox"]');
            
            const elementToScroll = termsLabel || termsCheckbox;
            if (elementToScroll) {
                elementToScroll.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add a subtle highlight effect to the terms section
                const termsSection = elementToScroll.closest('section');
                if (termsSection) {
                    termsSection.classList.add('ring-2', 'ring-red-500', 'ring-offset-2', 'transition-all', 'duration-300');
                    setTimeout(() => {
                        termsSection.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
                    }, 2000);
                }
            }
            
            // Don't proceed with payment
            return;
        }
        
        // Validate form before submission
        if (!validateForm()) {
            // Show alert for form validation
            const firstErrorField = document.querySelector('[class*="border-red-500"]');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                (firstErrorField as HTMLElement).focus();
            }
            return;
        }
        
        // If all validations pass, proceed with payment
        setIsSubmitting(true);

        // Persist guest information to Redux
        dispatch(setCustomerInfo(formData));

        // Simulate a brief validation
        setTimeout(() => {
            router.push('/payment');
        }, 800);
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            clearValidationErr();
            return;
        }

        try {
            await validatePromo(promoCode.trim(), property?.hotelCode);
            setApplied(promoCode.trim());
        } catch (error) {
            console.error('Promo code validation failed:', error);
        }
    };

    const handleRemovePromo = () => {
        setPromoCode('');
        clearCurrentPromo();
        clearValidationErr();
    };

    if (reservation.items.length === 0) return null;

    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white pb-12">
            {!isHeadless && <Header />}

            <main className={`container mx-auto px-6 ${isHeadless ? 'py-12' : 'pt-32 pb-24'}`}>
                <ScrollReveal className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-charcoal :text-brand-cream uppercase tracking-tighter mb-4">
                        {t('booking.confirmYourJourney')}
                    </h1>
                    <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: property?.ibeHeaderColour || '#CC2229' }}></div>
                    <p className="text-zinc-500 font-light italic text-lg uppercase tracking-widest">{t('booking.almostThere')}</p>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Form & Info */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Personal Information */}
                        <ScrollReveal>
                            <section className="bg-white :bg-zinc-900 rounded-3xl p-8 border border-brand-gold/10 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase">{t('booking.personalInformation')}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('booking.firstName')}</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="James"
                                            className={`w-full bg-zinc-50 :bg-zinc-800/50 border rounded-xl px-4 py-3 outline-none transition-all ${
                                                errors.firstName 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-zinc-200 :border-zinc-800 focus:border-brand-gold'
                                            }`}
                                        />
                                        {errors.firstName && (
                                            <p className="text-xs text-red-500 font-medium mt-1">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('booking.lastName')}</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Sutherland"
                                            className={`w-full bg-zinc-50 :bg-zinc-800/50 border rounded-xl px-4 py-3 outline-none transition-all ${
                                                errors.lastName 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-zinc-200 :border-zinc-800 focus:border-brand-gold'
                                            }`}
                                        />
                                        {errors.lastName && (
                                            <p className="text-xs text-red-500 font-medium mt-1">{errors.lastName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('booking.emailAddress')}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="james@example.com"
                                            className={`w-full bg-zinc-50 :bg-zinc-800/50 border rounded-xl px-4 py-3 outline-none transition-all ${
                                                errors.email 
                                                    ? 'border-red-500 focus:border-red-500' 
                                                    : 'border-zinc-200 :border-zinc-800 focus:border-brand-gold'
                                            }`}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-500 font-medium mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('booking.phoneNumber')}</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+1 234 567 890"
                                            className="w-full bg-zinc-50 :bg-zinc-800/50 border border-zinc-200 :border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('booking.estimatedArrivalTime')}</label>
                                        <input
                                            type="time"
                                            name="estimatedArrivalTime"
                                            value={formData.estimatedArrivalTime}
                                            onChange={handleInputChange}
                                            className="w-full bg-zinc-50 :bg-zinc-800/50 border border-zinc-200 :border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('booking.specialRequests')}</label>
                                        <textarea
                                            name="specialRequests"
                                            value={formData.specialRequests}
                                            onChange={handleInputChange}
                                            placeholder="E.g., early check-in, dietary requirements..."
                                            rows={2}
                                            className="w-full bg-zinc-50 :bg-zinc-800/50 border border-zinc-200 :border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </section>
                        </ScrollReveal>

                        {/* Policies & Terms */}
                        <ScrollReveal>
                            <section className="relative bg-brand-charcoal/5 :bg-zinc-800/20 rounded-3xl p-8 border border-brand-gold/5 space-y-6">
                                <h2 className="text-xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase tracking-tight mb-2">{t('booking.policiesAndTerms')}</h2>

                                <div className="space-y-3">
                                    {/* Cancellation Policy */}
                                    <div className="border border-brand-gold/10 rounded-2xl bg-white/50 :bg-zinc-900/50 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('cancellation')}
                                            className="w-full flex items-center justify-between p-5 text-left group transition-colors hover:bg-zinc-50 :hover:bg-zinc-800/50"
                                        >
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-charcoal :text-brand-cream">{t('booking.cancellationPolicy')}</span>
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                className={`text-brand-gold transition-transform duration-300 ${expandedSections.includes('cancellation') ? 'rotate-180' : ''}`}
                                            >
                                                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes('cancellation') ? 'max-h-96' : 'max-h-0'}`}>
                                            <div className="p-5 pt-0 text-[10px] text-zinc-500 :text-zinc-400 font-light leading-relaxed space-y-3 border-t border-brand-gold/5">
                                                {property?.ibE_CancellationPolicy ? (
                                                    <div dangerouslySetInnerHTML={{ __html: property.ibE_CancellationPolicy }} />
                                                ) : (
                                                    <p></p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Child Policy */}
                                    <div className="border border-brand-gold/10 rounded-2xl bg-white/50 :bg-zinc-900/50 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('child-policy')}
                                            className="w-full flex items-center justify-between p-5 text-left group transition-colors hover:bg-zinc-50 :hover:bg-zinc-800/50"
                                        >
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-charcoal :text-brand-cream">{t('booking.childPolicy')}</span>
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                className={`text-brand-gold transition-transform duration-300 ${expandedSections.includes('child-policy') ? 'rotate-180' : ''}`}
                                            >
                                                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes('child-policy') ? 'max-h-96' : 'max-h-0'}`}>
                                            <div className="p-5 pt-0 text-[10px] text-zinc-500 :text-zinc-400 font-light leading-relaxed space-y-3 border-t border-brand-gold/5">
                                                {property?.ibE_ChildPolicy ? (
                                                    <div dangerouslySetInnerHTML={{ __html: property.ibE_ChildPolicy }} />
                                                ) : (
                                                    <p></p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tax Policy */}
                                    <div className="border border-brand-gold/10 rounded-2xl bg-white/50 :bg-zinc-900/50 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('tax-policy')}
                                            className="w-full flex items-center justify-between p-5 text-left group transition-colors hover:bg-zinc-50 :hover:bg-zinc-800/50"
                                        >
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-charcoal :text-brand-cream">{t('booking.taxPolicy')}</span>
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                className={`text-brand-gold transition-transform duration-300 ${expandedSections.includes('tax-policy') ? 'rotate-180' : ''}`}
                                            >
                                                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes('tax-policy') ? 'max-h-96' : 'max-h-0'}`}>
                                            <div className="p-5 pt-0 text-[10px] text-zinc-500 :text-zinc-400 font-light leading-relaxed space-y-3 border-t border-brand-gold/5">
                                                {property?.ibE_TaxPolicy ? (
                                                    <div dangerouslySetInnerHTML={{ __html: property.ibE_TaxPolicy }} />
                                                ) : (
                                                    <p></p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    {/* Terms Alert Tooltip - pointing to checkbox */}
                                    {showTermsAlert && (
                                        <div className="absolute bottom-full left-0 mb-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="relative bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-3 min-w-[280px]">
                                                {/* Arrow pointing down to checkbox */}
                                                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-red-50 border-r border-b border-red-200 transform rotate-45"></div>
                                                
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-shrink-0">
                                                        <svg className="w-4 h-4 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-red-800">
                                                            Please accept the Terms and Conditions to proceed with payment.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowTermsAlert(false)}
                                                        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <label className="flex items-start gap-4 cursor-pointer group pt-4 relative">
                                        <div
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'border-transparent' : 'border-zinc-300 :border-zinc-700'}`}
                                            style={agreedToTerms ? { backgroundColor: property?.ibeHeaderColour || '#CC2229' } : {}}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={agreedToTerms}
                                                onChange={() => {
                                                    setAgreedToTerms(!agreedToTerms);
                                                    if (showTermsAlert) setShowTermsAlert(false);
                                                }}
                                            />
                                            {agreedToTerms && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-semibold uppercase tracking-wide text-zinc-700 :text-zinc-300 mb-2 block">
                                                {t('booking.consentText')}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </section>
                        </ScrollReveal>
                    </div>

                    {/* Right Column: Summary & Support */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Booking Summary Card */}
                        <div className="bg-white rounded-xl p-8 border border-zinc-200 shadow-xl space-y-8 sticky top-24">
                            <h2 className="text-2xl font-serif text-[#1D2B5B] uppercase tracking-tight border-b border-zinc-100 pb-4">
                                {t('booking.yourSelection')}
                            </h2>

                            {reservation.items.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {reservation.items.map((item, index) => (
                                            <div key={item.id} className="flex justify-between items-start gap-4 p-4 bg-zinc-50 rounded-lg relative">
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">{t('booking.room')} {index + 1}</div>
                                                    <div className="font-bold text-base text-zinc-900 uppercase">{item.name}</div>
                                                    <div className="text-sm text-zinc-500 mt-1 flex gap-2">
                                                        <span>{item.mealPlan}</span>
                                                        <span>•</span>
                                                        <span>{item.adults} {item.adults === 1 ? t('booking.adult') : t('booking.adults')} {item.children > 0 && `& ${item.children} ${item.children === 1 ? t('booking.child') : t('booking.children')}`}</span>
                                                    </div>
                                                    <div className="text-sm text-zinc-600 mt-1">
                                                        {item.checkIn && item.checkOut ? (
                                                            <span>
                                                                {format(parseISO(item.checkIn), 'MMM dd')} - {format(parseISO(item.checkOut), 'MMM dd, yyyy')}
                                                            </span>
                                                        ) : (
                                                            <span>Select dates</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <button
                                                        onClick={() => dispatch(removeRoom(item.id))}
                                                        className="text-zinc-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6L18 18" /></svg>
                                                    </button>
                                                </div>
                                                {/* Price in right-bottom corner */}
                                                <div className="absolute bottom-3 right-3 text-base font-bold text-[#5B2E83]">
                                                    {getCurrencySymbol(displayCurrency)} {convertPrice(item.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-6 border-t border-zinc-100 space-y-4 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                                        <div className="flex justify-between items-center text-brand-charcoal :text-brand-cream">
                                            <div className="flex items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-gold">
                                                    <path d="M8 7V3M16 7V3M3 11H21M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 3H5C3.89543 3 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span>{t('booking.stayPeriod')}</span>
                                            </div>
                                            <span>
                                                {checkIn ? format(parseISO(checkIn), 'MMM dd') : 'TBD'} — {checkOut ? format(parseISO(checkOut), 'MMM dd, yyyy') : 'TBD'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-zinc-100 space-y-4">
                                        <div className="flex justify-between text-zinc-500 uppercase text-sm font-bold tracking-widest"><span>Subtotal</span><span className="text-zinc-900 :text-zinc-100">{getCurrencySymbol(displayCurrency)} {convertPrice(totalAmount)}</span></div>
                                        {hasValidPromo && discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600 uppercase text-sm font-bold tracking-widest">
                                                <span>Discount ({appliedPromoCode})</span>
                                                <span>-{getCurrencySymbol(displayCurrency)} {convertPrice(discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end pt-2">
                                            <span className="text-brand-charcoal :text-zinc-400 font-bold uppercase text-sm tracking-widest">Total Investment</span>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold font-serif leading-none block" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>{getCurrencySymbol(displayCurrency)} {convertPrice(finalTotal)}</span>
                                                {/* <span className="text-sm text-zinc-400 font-medium uppercase tracking-widest">Including taxes</span> */}
                                            </div>
                                        </div>

                                    {/* Promo Code Section */}
                                    <div className="border-t border-zinc-100 pt-6">
                                        <div className="space-y-4">
                                            <div className="text-base font-medium text-zinc-700">{t('booking.havePromoCode')}</div>
                                            {!hasValidPromo ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={promoCode}
                                                        onChange={(e) => {
                                                            setPromoCode(e.target.value);
                                                            clearValidationErr();
                                                        }}
                                                        placeholder={t('booking.enterPromoCode')}
                                                        className={`flex-1 px-4 py-2 border rounded-lg text-sm outline-none transition-all ${
                                                            validationError 
                                                                ? 'border-red-500 focus:border-red-500' 
                                                                : 'border-zinc-300 focus:border-[#1D2B5B]'
                                                        }`}
                                                    />
                                                    <button
                                                        onClick={handleApplyPromo}
                                                        disabled={isValidating || !promoCode.trim()}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                                            isValidating || !promoCode.trim()
                                                                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                                                : 'bg-[#1D2B5B] text-white hover:bg-[#2D3B6B]'
                                                        }`}
                                                    >
                                                        {isValidating ? (
                                                            <div className="w-4 h-4 border-2 border-zinc-300 border-t-white rounded-full animate-spin mx-auto"></div>
                                                        ) : (
                                                            'Apply'
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                                                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <span className="text-sm text-green-700 font-medium">{t('booking.promoApplied')} <span className="font-bold">{appliedPromoCode?.toUpperCase() || promoCode.toUpperCase()}</span>!</span>
                                                    </div>
                                                    <button
                                                        onClick={handleRemovePromo}
                                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                            {validationError && (
                                                <p className="text-xs text-red-500 font-medium">{validationError}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={isSubmitting}
                                        className={`w-full py-4 text-white text-center rounded-lg font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:transform active:scale-[0.98] transition-all shadow-lg block ${
                                            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                                        }`}
                                        style={{ backgroundColor: !isSubmitting ? (property?.ibeHeaderColour || '#5B2E83') : '#9CA3AF' }}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            'Process to Payment'
                                        )}
                                    </button>

                                    {/* Security & Compliance Logos */}
                                    <div className="pt-6 border-t border-zinc-100">
                                        <div className="flex items-center justify-center gap-6 py-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <img 
                                                    src="/images/pci-dss-compliant-logo-vector.svg" 
                                                    alt="PCI DSS Compliant" 
                                                    className="w-12 h-12 rounded-lg"
                                                />
                                                <span className="text-[8px] text-zinc-500 font-medium">Secured</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <img 
                                                    src="/images/mastercard-id-check.svg" 
                                                    alt="ID Check" 
                                                    className="w-12 h-12 rounded-lg"
                                                />
                                                <span className="text-[8px] text-zinc-500 font-medium">ID Check</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <img 
                                                    src="/images/visa-secure-badge-logo.svg" 
                                                    alt="VISA Secure" 
                                                    className="w-12 h-12 rounded-lg"
                                                />
                                                <span className="text-[8px] text-zinc-500 font-medium">Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Need Help? Support Section */}
                                    <div className="pt-8 border-t border-zinc-100">
                                        <div className="flex items-start gap-4 p-5 bg-brand-cream :bg-zinc-800/30 rounded-2xl border border-brand-gold/5">
                                            <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold shrink-0">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.11-2.11a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal :text-brand-cream">{t('booking.needHelpConcierge')}</div>
                                                <p className="text-[10px] text-zinc-500 font-light leading-relaxed italic">{t('booking.conciergeAvailable')} {property?.name || 'HotelMate'}.</p>
                                                <div className="pt-2 flex flex-col gap-1">
                                                    {property?.hotelPhone && (
                                                        <a href={`tel:${property.hotelPhone}`} className="text-[10px] font-bold hover:underline" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>{property.hotelPhone}</a>
                                                    )}
                                                    {property?.hotelEmail && (
                                                        <a href={`mailto:${property.hotelEmail}`} className="text-[10px] font-bold hover:underline" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>{property.hotelEmail}</a>
                                                    )}
                                                    {!property?.hotelPhone && !property?.hotelEmail && (
                                                        <>
                                                            <a href="tel:+1234567890" className="text-[10px] font-bold hover:underline" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>+1 234 567 890</a>
                                                            <a href="mailto:concierge@hotelmate.app" className="text-[10px] font-bold hover:underline" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>concierge@hotelmate.app</a>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ) : (
                                <div className="py-12 text-center text-zinc-400 italic text-sm">
                                    {t('booking.basketEmpty')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {!isHeadless && <Footer />}
        </div>
    );
};

const CheckoutPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white :bg-zinc-950 flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
};

export default CheckoutPage;