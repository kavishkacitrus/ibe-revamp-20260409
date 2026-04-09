'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScrollReveal from '@/app/components/ScrollReveal';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { clearReservation, setPaymentMethod } from '@/store/slices/reservationSlice';
import { fetchHotelIPG, generatePaymentLink } from '@/store/slices/propertySlice';
import { createPaypalOrder } from '@/store/slices/paypalSlice';
import { selectCurrentPromoCode } from '@/store/slices/promoCodeSlice';
import { encryptData } from '@/app/utils/encryption';
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';


const PaymentPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const reservation = useAppSelector((state) => state.reservation);
    const hotelId = reservation.items[0]?.hotelId;
    const { hotelIPGs, properties } = useAppSelector((state) => state.property);
    const ipgs = hotelId ? (hotelIPGs[hotelId] || []) : [];
    const { customerInfo, totalAmount, items: reservationItems, currency } = reservation;
    const currentPromoCode = useAppSelector(selectCurrentPromoCode);
    const { checkIn, checkOut, destination, guests, mealPlan: bookingMealPlan, residency } = useAppSelector((state) => state.booking);

    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [showIframe, setShowIframe] = useState(false);
    const [payPercentage, setPayPercentage] = useState<100 | 50>(100);
    const [selectedPayOption, setSelectedPayOption] = useState<'pay_at_hotel' | 'pay_later'>('pay_at_hotel');

    // FIX: Clear stale payment method data when starting fresh booking
    useEffect(() => {
        // Check if we're starting a fresh booking (no reservation in localStorage)
        const savedReservation = localStorage.getItem('hm_reservation');
        if (!savedReservation && reservation.items.length === 0) {
            // Clear any stale payment method data when starting fresh
            localStorage.removeItem('selectedPaymentMethod');
            localStorage.removeItem('paymentMethodDetails');
        }
    }, [reservation.items.length]);

    // Calculate discount amount if promo code is applied
    const discountAmount = currentPromoCode && currentPromoCode.value ?
        Math.round((totalAmount * currentPromoCode.value) / 100) : 0;
    const finalTotal = totalAmount - discountAmount;

    const property = properties.find(p => String(p.id) === String(hotelId));
    const isPartialPayAvailable = property?.ibE_Pay50 === true;

    const amountToPay = payPercentage === 50 ? finalTotal / 2 : finalTotal;

    const selectedIpg = ipgs.find(ipg => ipg.ipgId === selectedMethodId);
    const isPayAtHotel = selectedIpg?.ipgName.toLowerCase().includes('hotel');

    useEffect(() => {
        if (hotelId) {
            dispatch(fetchHotelIPG(hotelId));
        }
    }, [hotelId, dispatch]);

    useEffect(() => {
        if (ipgs.length > 0 && selectedMethodId === null) {
            // Try to load saved payment method from localStorage
            const savedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
            if (savedPaymentMethod) {
                const savedMethodId = parseInt(savedPaymentMethod);
                const savedIpg = ipgs.find(ipg => ipg.ipgId === savedMethodId);
                if (savedIpg) {
                    setSelectedMethodId(savedMethodId);
                } else {
                    // Fallback to first method if saved method not found
                    setSelectedMethodId(ipgs[0].ipgId);
                }
            } else {
                // Default to first method
                setSelectedMethodId(ipgs[0].ipgId);
            }
        }
    }, [ipgs, selectedMethodId]);

    useEffect(() => {
        if (selectedMethodId !== null) {
            localStorage.setItem('selectedPaymentMethod', selectedMethodId.toString());
        }

        // Initialize payment method if it's Pay at Hotel and no option is selected yet
        if (isPayAtHotel && property?.ibE_AllowPayLater && !reservation.paymentMethod) {
            dispatch(setPaymentMethod('pay_at_hotel'));
            setSelectedPayOption('pay_at_hotel');
        }
    }, [selectedMethodId, isPayAtHotel, property, reservation.paymentMethod, dispatch]);

    useEffect(() => {
        if (reservation.items.length === 0) {
            router.push('/');
        }
    }, [reservation.items, router]);

    const handleCompleteBooking = async () => {
        const selectedIpg = ipgs.find(ipg => ipg.ipgId === selectedMethodId);
        const orderId = `IBE-${hotelId}-${Date.now()}`;

        if (selectedIpg?.ipgName.toLowerCase().includes('payplus')) {
            setIsProcessing(true);
            try {
                const payload = {
                    hotelId: hotelId,
                    currency: currency || 'USD',
                    amount: amountToPay,
                    orderId: orderId,
                    description: `Sanctuary Booking at Hotel ${hotelId} (${payPercentage}% payment)`,
                    redirectUrl: `${window.location.origin}/payment/success?v=${encryptData({ orderId, amount: amountToPay, hotelId, paidPercentage: payPercentage })}`,
                    customerInfo: {
                        firstname: customerInfo?.firstName || '',
                        lastname: customerInfo?.lastName || '',
                        email: customerInfo?.email || '',
                        phoneNumber: customerInfo?.phone || '',
                        dialCode: "+94"
                    }
                };

                const resultAction = await dispatch(generatePaymentLink(payload));

                if (generatePaymentLink.fulfilled.match(resultAction)) {
                    const responseData = resultAction.payload;
                    if (responseData.result === "SUCCESS" && responseData.data?.link) {
                        setPaymentLink(responseData.data.link);
                        setShowIframe(true);
                    } else {
                        alert('Could not generate payment link. Please try again.');
                    }
                } else {
                    alert('Payment gateway error. Please try another method.');
                }
            } catch (error) {
                console.error("Payment Link Error:", error);
                alert('Something went wrong. Please try again later.');
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        if (selectedIpg?.ipgName.toLowerCase().includes('paypal')) {
            setIsProcessing(true);
            try {
                const paypalPayload = {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            payee: {
                                merchant_id: selectedIpg.merchandIdUSD || "2FWC44PK88G66"
                            },
                            amount: {
                                currency_code: currency || 'USD',
                                value: amountToPay.toFixed(2)
                            }
                        }
                    ],
                    payment_source: {
                        paypal: {
                            experience_context: {
                                payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                                landing_page: "LOGIN",
                                shipping_preference: "NO_SHIPPING",
                                user_action: "PAY_NOW",
                                return_url: `${window.location.origin}/payment/success?v=${encryptData({ orderId, amount: amountToPay, hotelId, paidPercentage: payPercentage })}`,
                                cancel_url: `${window.location.origin}/payment`
                            }
                        }
                    }
                };

                const resultAction = await dispatch(createPaypalOrder(paypalPayload));

                if (createPaypalOrder.fulfilled.match(resultAction)) {
                    const responseData = resultAction.payload;
                    const approvalLink = responseData.links.find((link: any) => link.rel === 'payer-action');
                    if (approvalLink) {
                        // Store PayPal order ID for later capture
                        localStorage.setItem('paypal_order_id', responseData.id);

                        // Store payment method details for voucher generation
                        localStorage.setItem('paymentMethodDetails', JSON.stringify({
                            ipgId: selectedIpg?.ipgId,
                            ipgName: selectedIpg?.ipgName,
                            bankName: selectedIpg?.bankName,
                            isPayAtHotel: isPayAtHotel
                        }));

                        // Persist state before Redirecting
                        localStorage.setItem('hm_reservation', JSON.stringify(reservation));
                        localStorage.setItem('hm_booking', JSON.stringify({ checkIn, checkOut, destination, guests, mealPlan: bookingMealPlan, residency }));

                        window.location.href = approvalLink.href;
                    } else {
                        alert('PayPal approval link not found. Please try again.');
                    }
                } else {
                    alert('PayPal order creation failed. Please try another method.');
                }
            } catch (error) {
                console.error("PayPal Order Error:", error);
                alert('Something went wrong with PayPal. Please try again later.');
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        setIsProcessing(true);
        // Persist state before Redirecting/Success
        localStorage.setItem('hm_reservation', JSON.stringify(reservation));
        localStorage.setItem('hm_booking', JSON.stringify({ checkIn, checkOut, destination, guests, mealPlan: bookingMealPlan, residency }));

        // Store payment method details for voucher generation
        if (selectedIpg) {
            localStorage.setItem('paymentMethodDetails', JSON.stringify({
                ipgId: selectedIpg.ipgId,
                ipgName: selectedIpg.ipgName,
                bankName: selectedIpg.bankName,
                isPayAtHotel: isPayAtHotel
            }));
        }

        // Simulate payment and order creation for other methods
        setTimeout(() => {
            const encryptedData = encryptData({
                orderId,
                amount: amountToPay,
                hotelId,
                paidPercentage: payPercentage,
                method: isPayAtHotel ? 'hotel' : (selectedIpg?.ipgName.toLowerCase().includes('paypal') ? 'paypal' : undefined)
            });
            router.push(`/payment/success?v=${encryptedData}`);
        }, 2500);
    };

    if (reservation.items.length === 0) return null;

    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white pb-12">
            <Header />

            <main className="container mx-auto px-4 md:px-6 pt-32 pb-24">
                <ScrollReveal className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-6xl font-serif font-bold text-brand-charcoal :text-brand-cream uppercase tracking-tighter mb-4">
                        Secure Your Booking
                    </h1>
                    <div className="h-1 w-24 bg-brand-red mx-auto mb-6"></div>
                    <p className="text-zinc-500 font-light italic text-base md:text-lg uppercase tracking-widest">Final step to finalize your journey</p>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
                    {/* Left Column: Payment Methods */}
                    <div className="lg:col-span-7 space-y-6 md:space-y-8">
                        <ScrollReveal>
                            <section className="bg-white :bg-zinc-900 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-brand-gold/10 shadow-sm space-y-6 md:space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase">{t('payment.paymentMethod')}</h2>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    {ipgs.length > 0 ? (
                                        ipgs.map((ipg) => {
                                            const isThisPayAtHotel = ipg.ipgName.toLowerCase().includes('hotel');
                                            return (
                                                <button
                                                    key={ipg.ipgId}
                                                    onClick={() => setSelectedMethodId(ipg.ipgId)}
                                                    className={`w-full flex items-center justify-between p-4 md:p-6 rounded-xl md:rounded-2xl border transition-all ${selectedMethodId === ipg.ipgId ? 'border-brand-gold bg-brand-gold/5' : 'border-zinc-100 :border-zinc-800 hover:border-brand-gold/50'}`}
                                                >
                                                    <div className="flex items-center gap-3 md:gap-4">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethodId === ipg.ipgId ? 'border-brand-gold' : 'border-zinc-300'}`}>
                                                            {selectedMethodId === ipg.ipgId && <div className="w-2.5 h-2.5 bg-brand-gold rounded-full"></div>}
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-brand-charcoal :text-brand-cream">{ipg.ipgName}</div>
                                                            <div className="text-[8px] md:text-[10px] text-zinc-400 uppercase tracking-tight">{ipg.bankName} Gateway — {ipg.isSandBoxMode ? 'Sandbox Mode' : 'Live Mode'}</div>
                                                        </div>
                                                    </div>
                                                    {/* Only show payment logos if NOT pay at hotel */}
                                                    {!isThisPayAtHotel && (
                                                        <div className="flex gap-1 md:gap-2 transition-all">
                                                            <img src="/images/visa-secure-badge-logo.svg" alt="Visa" className="h-6 w-6 md:h-8 md:w-8 object-contain" />
                                                            <img src="/images/mastercard-id-check.svg" alt="Mastercard" className="h-6 w-6 md:h-8 md:w-8 object-contain" />
                                                            <img src="/images/pci-dss-compliant-logo-vector.svg" alt="PCI DSS" className="h-6 w-6 md:h-8 md:w-8 object-contain" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="py-8 text-center space-y-4">
                                            <div className="w-12 h-12 bg-zinc-100 :bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('payment.retrievingGateways')}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </ScrollReveal>

                        <div className="flex items-center gap-4 text-zinc-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 7H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{t('payment.paymentSecure')}</p>
                        </div>
                    </div>

                    {/* Right Column: Final Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white :bg-zinc-900 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-brand-gold/20 shadow-2xl space-y-6 md:space-y-8 sticky top-24">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase tracking-tight mb-2">{t('payment.finalSummary')}</h2>
                                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: property?.ibeHeaderColour || '#CC2229' }}></div>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-4">{t('payment.reviewReservation')}</p>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                {reservation.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-3 md:py-4 border-b border-brand-gold/5 last:border-0">
                                        <div className="space-y-1">
                                            <div className="font-bold text-sm md:text-base text-brand-charcoal :text-brand-cream uppercase">{item.name}</div>
                                            <div className="text-xs md:text-sm text-zinc-400 uppercase tracking-widest">
                                                {item.adults} {t('common.adults')} • {item.children} {t('common.children')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm md:text-base font-bold text-brand-charcoal :text-brand-cream">{getCurrencySymbol(currency || 'USD')} {item.price}</div>
                                            <div className="text-xs md:text-sm text-zinc-400 uppercase">{t('common.perNight')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 md:space-y-4 pt-4">
                                {isPartialPayAvailable && !isPayAtHotel && (
                                    <div className="space-y-3 p-3 md:p-4 bg-brand-gold/5 rounded-xl md:rounded-2xl border border-brand-gold/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{t('payment.paymentOption')}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPayPercentage(100)}
                                                className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${payPercentage === 100 ? 'text-white shadow-lg' : 'border-zinc-200 :border-zinc-800 text-zinc-400'}`}
                                                style={payPercentage === 100 ? { backgroundColor: property?.ibeHeaderColour || '#B18B8B', borderColor: property?.ibeHeaderColour || '#B18B8B' } : {}}
                                            >
                                                {t('payment.fullPayment')}
                                            </button>
                                            <button
                                                onClick={() => setPayPercentage(50)}
                                                className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${payPercentage === 50 ? 'bg-brand-red border-brand-red text-white shadow-lg' : 'border-zinc-200 :border-zinc-800 text-zinc-400'}`}
                                            >
                                                {t('payment.pay50Now')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isPayAtHotel && property?.ibE_AllowPayLater && (
                                    <div className="space-y-3 p-3 md:p-4 bg-brand-gold/5 rounded-xl md:rounded-2xl border border-brand-gold/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{t('payment.paymentOption')}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedPayOption('pay_at_hotel');
                                                    dispatch(setPaymentMethod('pay_at_hotel'));
                                                }}
                                                className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${selectedPayOption === 'pay_at_hotel' ? 'text-white shadow-lg' : 'border-zinc-200 :border-zinc-800 text-zinc-400'}`}
                                                style={selectedPayOption === 'pay_at_hotel' ? { backgroundColor: property?.ibeHeaderColour || '#B18B8B', borderColor: property?.ibeHeaderColour || '#B18B8B' } : {}}
                                            >
                                                Pay On Arrival
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedPayOption('pay_later');
                                                    dispatch(setPaymentMethod('pay_later'));
                                                }}
                                                className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl border text-xs md:text-sm font-bold uppercase tracking-widest transition-all ${selectedPayOption === 'pay_later' ? 'text-white shadow-lg' : 'border-zinc-200 :border-zinc-800 text-zinc-400'}`}
                                                style={selectedPayOption === 'pay_later' ? { backgroundColor: property?.ibeHeaderColour || '#B18B8B', borderColor: property?.ibeHeaderColour || '#B18B8B' } : {}}
                                            >
                                                Pay Later
                                            </button>
                                        </div>
                                        {selectedPayOption === 'pay_later' && (
                                            <p className="text-[9px] text-zinc-500 italic mt-2">
                                                Payment should be made within {property.ibE_PayLater_Days} days
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-500">
                                    <span>{t('payment.stayDuration')}</span>
                                    <span className="text-brand-charcoal :text-brand-cream">
                                        {checkIn ? format(parseISO(checkIn), 'MMM dd') : ''} — {checkOut ? format(parseISO(checkOut), 'MMM dd') : ''}
                                    </span>
                                </div>
                                <div className="space-y-1 pt-4 md:pt-6 border-t border-brand-gold/10">
                                    <div className="flex justify-between items-center text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                        <span>{t('payment.subtotal')}</span>
                                        <span>{getCurrencySymbol(currency || 'USD')} {totalAmount}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-green-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                                            <span>{t('payment.discount')} ({currentPromoCode?.promoCode})</span>
                                            <span>-{getCurrencySymbol(currency || 'USD')} {discountAmount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs md:text-sm font-bold uppercase tracking-widest" style={{ color: property?.ibeHeaderColour || '#B18B8B' }}>
                                            {isPayAtHotel ? t('payment.amountPayableAtHotel') : (payPercentage === 50 ? t('payment.amountToPay50') : t('payment.totalInvestment'))}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-2xl md:text-4xl font-serif font-bold leading-none block" style={{ color: property?.ibeHeaderColour || '#B18B8B' }}>{getCurrencySymbol(currency || 'USD')} {isPayAtHotel ? finalTotal : amountToPay}</span>
                                            <span className="text-[8px] md:text-[9px] text-zinc-400 lowercase italic">
                                                {isPayAtHotel ? t('payment.noImmediatePayment') : (payPercentage === 50 ? t('payment.remaining50Payable') : t('payment.allTaxesIncluded'))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCompleteBooking}
                                disabled={isProcessing || !selectedMethodId}
                                className={`w-full py-4 md:py-6 rounded-full font-bold uppercase tracking-[0.4em] text-xs transition-all shadow-xl flex items-center justify-center gap-4 ${isProcessing || !selectedMethodId
                                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                    : 'text-white hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                                style={!isProcessing && selectedMethodId ? { backgroundColor: property?.ibeHeaderColour || '#B18B8B' } : {}}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-brand-red/30 border-t-brand-red rounded-full animate-spin"></div>
                                        {t('payment.processing')}
                                    </>
                                ) : (
                                    payPercentage === 50 ? t('payment.pay50Confirm') : (isPayAtHotel ? t('payment.confirmTentative') : t('payment.completeFullPayment'))
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* PayPlus Iframe Overlay */}
            {showIframe && paymentLink && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-charcoal/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="relative w-full max-w-4xl aspect-[4/5] md:aspect-video bg-white rounded-3xl overflow-hidden shadow-2xl border border-brand-gold/20 flex flex-col">
                        <div className="p-4 border-b border-brand-gold/10 flex justify-between items-center bg-brand-cream/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">{t('payment.secureSanctuaryPayment')}</h3>
                            </div>
                            <button
                                onClick={() => setShowIframe(false)}
                                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-brand-red hover:border-brand-red transition-all"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 bg-zinc-50 relative">
                            <div className="absolute inset-0 flex items-center justify-center -z-10">
                                <div className="space-y-4 text-center">
                                    <div className="w-12 h-12 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto"></div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">{t('payment.loadingSecureGateway')}</p>
                                </div>
                            </div>
                            <iframe
                                src={paymentLink}
                                className="w-full h-full border-0"
                                title="PayPlus Secure Payment"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;