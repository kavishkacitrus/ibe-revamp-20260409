'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSelectedCurrency } from '@/store/slices/currencySlice';
import ScrollReveal from '@/app/components/ScrollReveal';
import PromoToast from '@/app/components/PromoToast';
import { useEffect, useState } from 'react';
import { fetchPropertyRooms } from '@/store/slices/propertySlice';
import { fetchHotelRatePlans } from '@/store/slices/ratePlanSlice';
import { fetchRoomFeatures } from '@/store/slices/roomFeatureSlice';
import { setDates, updateGuests } from '@/store/slices/bookingSlice';
import ImageSlider from '@/app/components/ImageSlider';
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrencySymbol } from '@/utils/currency';

const PropertyDetailSkeleton = () => (
    <div className="bg-brand-cream :bg-brand-charcoal min-h-screen animate-pulse">
        <div className="w-full h-[70vh] min-h-[500px] bg-zinc-200 :bg-zinc-800"></div>
        <div className="max-w-5xl mx-auto -mt-10 px-6 h-20 bg-zinc-100 :bg-zinc-900 rounded-full shadow-xl"></div>
        <div className="container mx-auto px-6 py-24">
            <div className="h-12 bg-zinc-200 :bg-zinc-800 w-1/3 rounded-lg mb-4"></div>
            <div className="h-6 bg-zinc-100 :bg-zinc-900 w-2/3 rounded-lg mb-16"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white :bg-zinc-900 rounded-3xl overflow-hidden shadow-sm h-[500px]">
                        <div className="aspect-video bg-zinc-100 :bg-zinc-800"></div>
                        <div className="p-8 space-y-6">
                            <div className="h-8 bg-zinc-200 :bg-zinc-800 rounded-lg w-3/4"></div>
                            <div className="h-20 bg-zinc-100 :bg-zinc-900 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const PropertyDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isHeadless = searchParams?.get('headless') === 'true';
    const slug = params.slug as string;
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [currentUrl, setCurrentUrl] = useState('');

    const { guests, checkIn, checkOut } = useAppSelector((state) => state.booking);
    const { properties, propertyRooms, roomsLoading, loading } = useAppSelector((state) => state.property);
    const { ratePlans } = useAppSelector((state) => state.ratePlan);
    const { features: allRoomFeatures } = useAppSelector((state) => state.roomFeature);
    const selectedCurrency = useAppSelector(selectSelectedCurrency);
    const exchangeRates = useAppSelector((state) => state.currency.exchangeRates);

    const property = properties.find(p => p.slug === slug || p.id === Number(slug));
    const id = property?.id;
    const rooms = id ? (propertyRooms[id] || []) : [];
    const propertyRatePlans = id ? (ratePlans[id] || []) : [];

    // Get current URL for meta tags
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    // Currency conversion logic - use rate plan currency instead of hardcoded USD
    const baseCurrency = propertyRatePlans.length > 0 ? (propertyRatePlans[0].currencyCode || 'USD') : 'USD';
    const rateKey = `${baseCurrency}_${selectedCurrency}`;
    const exchangeRate = exchangeRates[rateKey];
    const displayCurrency = (selectedCurrency !== baseCurrency && exchangeRate) ? selectedCurrency : baseCurrency;
    const convertPrice = (price: number) => {
        if (selectedCurrency === baseCurrency || !exchangeRate) return Math.round(price);
        return Math.round(price * exchangeRate.rate);
    };

    useEffect(() => {
        const checkinQuery = searchParams?.get('checkin');
        const checkoutQuery = searchParams?.get('checkout');
        const adultQuery = searchParams?.get('adult');
        const childQuery = searchParams?.get('child');
        const roomsQuery = searchParams?.get('rooms');

        if (checkinQuery && checkoutQuery) {
            const parseDate = (dStr: string) => {
                const parts = dStr.split('/');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`;
                }
                return null;
            };

            const parsedCheckIn = parseDate(checkinQuery);
            const parsedCheckOut = parseDate(checkoutQuery);

            if (parsedCheckIn && parsedCheckOut) {
                dispatch(setDates({ checkIn: parsedCheckIn, checkOut: parsedCheckOut }));

                const adultsVal = adultQuery ? parseInt(adultQuery, 10) : 2;
                const childrenVal = childQuery ? parseInt(childQuery, 10) : 0;
                const roomsVal = roomsQuery ? parseInt(roomsQuery, 10) : 1;

                dispatch(updateGuests({
                    adults: isNaN(adultsVal) ? 2 : adultsVal,
                    children: isNaN(childrenVal) ? 0 : childrenVal,
                    rooms: isNaN(roomsVal) ? 1 : roomsVal
                }));

                router.replace(`/hotels/${slug}/rooms-compact${isHeadless ? '?headless=true' : ''}`);
            }
        }
    }, [searchParams, dispatch, router, slug, isHeadless]);

    useEffect(() => {
        if (id) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const start = checkIn || today.toISOString();
            const end = checkOut || tomorrow.toISOString();

            if (id && !propertyRooms[id] && !roomsLoading) {
                dispatch(fetchPropertyRooms({ hotelId: id, startDate: start, endDate: end }));
            }
            if (!ratePlans[id]) {
                dispatch(fetchHotelRatePlans({ hotelId: id, isCmActive: false }));
            }
            if (!allRoomFeatures[id]) {
                dispatch(fetchRoomFeatures(id));
            }
        }
    }, [id, dispatch, propertyRooms, roomsLoading, checkIn, checkOut, allRoomFeatures, ratePlans]);

    if (!property && loading) {
        return <PropertyDetailSkeleton />;
    }

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream :bg-brand-charcoal text-brand-charcoal :text-brand-cream">
                <div className="text-center">
                    <h1 className="text-4xl font-serif mb-4">{t('property.notFound')}</h1>
                    <Link href="/" className="text-brand-red hover:underline font-medium">{t('property.returnToHome')}</Link>
                </div>
            </div>
        );
    }

    const totalGuests = guests.adults + guests.children;
    const filteredRooms = rooms.filter(room => room.capacity >= totalGuests);

    const startingPrice = rooms.length > 0
        ? Math.min(...rooms.map((room: any) => room.price))
        : null;

    const handleRoomClick = () => {
        if (checkIn && checkOut) {
            // Persist selected dates to localStorage as done in SearchBar
            try {
                localStorage.setItem('hotelmate_checkIn', checkIn);
                localStorage.setItem('hotelmate_checkOut', checkOut);
            } catch {
                // Ignore localStorage errors
            }
            router.push(`/hotels/${property?.slug || id}/rooms-compact${isHeadless ? '?headless=true' : ''}`);
        } else {
            // If dates are not set, scroll to search bar
            document.querySelector('.search-bar-container')?.scrollIntoView({ behavior: 'smooth' });
            // Alternatively, open the calendar
            const calendarTrigger = document.querySelector('[data-testid="calendar-trigger"]') as HTMLElement;
            if (calendarTrigger) calendarTrigger.click();
        }
    };

    const handleCompactRoomClick = () => {
        if (checkIn && checkOut) {
            try {
                localStorage.setItem('hotelmate_checkIn', checkIn);
                localStorage.setItem('hotelmate_checkOut', checkOut);
            } catch {
                // Ignore localStorage errors
            }
            router.push(`/hotels/${property?.slug || id}/rooms-compact${isHeadless ? '?headless=true' : ''}`);
        } else {
            document.querySelector('.search-bar-container')?.scrollIntoView({ behavior: 'smooth' });
            const calendarTrigger = document.querySelector('[data-testid="calendar-trigger"]') as HTMLElement;
            if (calendarTrigger) calendarTrigger.click();
        }
    };

    // Generate meta description from property data
    const metaDescription = property.description 
        ? property.description.substring(0, 160) 
        : `Experience luxury at ${property.name} in ${property.location}. Book your stay with HotelMate for an unforgettable journey.`;
    
    const metaTitle = `${property.name} - ${property.location} | HotelMate Premium Accommodation`;
    const metaImage = property.ibeHomeImage || '/images/default-hotel.jpg';
    const metaUrl = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <>
            <Head>
                {/* Basic Meta Tags */}
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={`${property.name}, ${property.location}, luxury hotel, boutique hotel, premium accommodation, hotel booking, ${property.tags?.join(', ') || ''}`} />
                
                {/* Open Graph / Facebook Meta Tags */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={metaUrl} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={metaImage} />
                <meta property="og:image:alt" content={`${property.name} - ${property.location}`} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:site_name" content="HotelMate" />
                <meta property="og:locale" content="en_US" />
                
                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={metaUrl} />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={metaImage} />
                <meta name="twitter:image:alt" content={`${property.name} - ${property.location}`} />
                <meta name="twitter:site" content="@HotelMate" />
                <meta name="twitter:creator" content="@HotelMate" />
                
                {/* Additional OG tags for better sharing */}
                {property.rating && (
                    <meta property="og:rating" content={property.rating.toString()} />
                )}
                <meta property="og:availability" content="available" />
                <meta property="og:price:currency" content={baseCurrency} />
                
                {/* WhatsApp / Telegram specific */}
                <meta property="og:rich_attachment" content="true" />
                <meta property="og:image:secure_url" content={metaImage} />
                
                {/* Structured Data for SEO (JSON-LD) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Hotel",
                            "name": property.name,
                            "description": property.description || `Experience luxury at ${property.name} in ${property.location}.`,
                            "image": metaImage,
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": property.location || '',
                                "addressCountry": "Sri Lanka"
                            },
                            "url": metaUrl,
                            "telephone": property.hotelPhone || '',
                            "email": property.hotelEmail || '',
                            "priceRange": startingPrice ? `$${startingPrice} - $${startingPrice * 5}` : undefined,
                            "starRating": property.rating ? {
                                "@type": "Rating",
                                "ratingValue": property.rating,
                                "bestRating": "5"
                            } : undefined,
                            "amenities": property.tags || [],
                        })
                    }}
                />
                
                {/* Canonical URL */}
                <link rel="canonical" href={metaUrl} />
                
                {/* Additional meta tags for social media */}
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <meta name="author" content="HotelMate" />
                <meta name="copyright" content="HotelMate" />
            </Head>

            <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white">
            {!isHeadless && <Header />}

            <main>
                {/* Back Link */}
                {/* <div className="container mx-auto px-6 py-6 absolute top-24 left-0 right-0 z-50">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 group"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:-translate-x-1 transition-transform">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to All Properties
                    </Link>
                </div> */}

                {/* Hero Section */}
                {!isHeadless && (
                    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
                        <img
                            src={property.ibeHomeImage}
                            alt={property.name}
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 container mx-auto">
                            <ScrollReveal className="animate-fade-up">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {property.tags.map((tag: string) => (
                                        <span key={tag} className="text-xs font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full" style={{ backgroundColor: property.ibeHeaderColour || '#CC2229' }}>{tag}</span>
                                    ))}
                                </div>
                                <h1 className="text-4xl md:text-7xl font-bold text-white font-serif mb-2 uppercase tracking-tight">{property.name}</h1>
                                <div className="flex items-center gap-2 text-brand-gold font-medium">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-lg" data-property-location={property.location}>{property.location}</span>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>
                )}

                {/* Overlapping Search Bar */}
                <div className={`relative z-20 ${isHeadless ? 'pt-8' : '-mt-10'} px-6 max-w-5xl mx-auto animate-fade-up search-bar-container`}>
                    <SearchBar hotelId={id} unavailableDates={property.unavailableDates} />
                </div>


                {/* Room Selection Section */}
                <section id="room-selection" className="py-24 container mx-auto px-6 overflow-hidden">
                    <ScrollReveal className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase tracking-tight mb-4">{t('property.exploreRooms')}</h2>
                                <p className="text-lg text-zinc-500 font-light italic">{t('property.roomsDescription')}</p>
                            </div>
                            {/* <button
                                onClick={handleCompactRoomClick}
                                className="md:ml-auto px-6 py-3 rounded-full bg-white text-brand-charcoal border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-2 h-fit"
                            >
                                <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse"></span>
                                Try Compact View
                            </button> */}
                        </div>

                        {/* Filter Status */}
                        <div className="flex items-center gap-4 bg-white/50 :bg-zinc-900/50 backdrop-blur-sm px-6 py-3 rounded-full border border-brand-gold/20 self-start">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('common.searchResults')}</span>
                                <span className="text-sm font-bold text-brand-charcoal :text-brand-cream">
                                    {filteredRooms.length} {filteredRooms.length === 1 ? t('common.room') : t('common.rooms')} {t('property.available')}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-brand-gold/20 mx-2"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('common.guests')}</span>
                                <span className="text-sm font-bold text-brand-red">{totalGuests} {t('property.people')}</span>
                            </div>
                        </div>
                    </ScrollReveal>

                    {roomsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white :bg-zinc-900 rounded-3xl overflow-hidden shadow-sm animate-pulse">
                                    <div className="aspect-video bg-zinc-200 :bg-zinc-800"></div>
                                    <div className="p-8 space-y-6">
                                        <div className="space-y-3">
                                            <div className="h-8 bg-zinc-200 :bg-zinc-800 rounded-lg w-3/4"></div>
                                            <div className="flex gap-2">
                                                <div className="h-4 bg-zinc-100 :bg-zinc-800 rounded w-16"></div>
                                                <div className="h-4 bg-zinc-100 :bg-zinc-800 rounded w-16"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-zinc-100 :bg-zinc-800 rounded w-full"></div>
                                            <div className="h-4 bg-zinc-100 :bg-zinc-800 rounded w-5/6"></div>
                                        </div>
                                        <div className="h-14 bg-zinc-200 :bg-zinc-800 rounded-full w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {filteredRooms.map((room: any, index: number) => (
                                <ScrollReveal
                                    key={room.id}
                                    stagger={index % 2 * 0.1}
                                    className="group"
                                >
                                    <div
                                        onClick={handleRoomClick}
                                        className={`bg-white :bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${checkIn && checkOut ? 'cursor-pointer' : 'cursor-help'}`}
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-zinc-100 :bg-zinc-800">
                                            {(() => {
                                                const roomImages = (id ? (allRoomFeatures[id] || []) : [])
                                                    .filter((f: any) => f.hotelRoomTypeID === room.roomTypeId && f.hotelRoomTypeImage)
                                                    .flatMap((f: any) => (f.hotelRoomTypeImage as any[]).map((img: any) => img.imageURL));

                                                // Get unique images
                                                const uniqueImages = Array.from(new Set(roomImages.length > 0 ? roomImages : []));

                                                // Only show ImageSlider if we have images
                                                if (uniqueImages.length === 0) {
                                                    return (
                                                        <div className="w-full h-full bg-zinc-200 :bg-zinc-700 flex items-center justify-center">
                                                            <div className="text-zinc-400 :text-zinc-500 text-center">
                                                                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <p className="text-sm">No images available</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <ImageSlider
                                                        images={uniqueImages}
                                                        alt={room.name}
                                                    />
                                                );
                                            })()}
                                            <div className="absolute top-6 left-6 bg-brand-charcoal/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] border border-white/10 z-10">
                                                {room.type}
                                            </div>
                                            <div className="absolute bottom-6 right-6 bg-brand-gold px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest shadow-lg z-10">
                                                {t('property.capacity')}: {room.capacity} {t('common.guests')}
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-2xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase mb-2">{room.name}</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {(() => {
                                                            if (!id) return null;
                                                            const roomFeatures = (allRoomFeatures[id] || [])
                                                                .filter((f: any) => f.hotelRoomTypeID === room.roomTypeId && f.isTrue);

                                                            const featureTags: string[] = roomFeatures.map((f: any) => f.roomFeature.featureName);

                                                            // Add availability as a dynamic tag
                                                            if (room.availableCount > 0) {
                                                                featureTags.push(`${room.availableCount} ${t('common.rooms')} ${t('property.available')}`);
                                                            }

                                                            return featureTags.slice(0, 4).map((feature: any) => (
                                                                <span key={feature} className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border" style={{ color: property.ibeHeaderColour || '#B18B8B', backgroundColor: (property.ibeHeaderColour || '#B18B8B') + '0D', borderColor: (property.ibeHeaderColour || '#B18B8B') + '1A' }}>
                                                                    {feature}
                                                                </span>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold font-serif" style={{ color: property.ibeHeaderColour || '#CC2229' }}>
                                                        {getCurrencySymbol(displayCurrency)} {convertPrice(room.paxRates[guests.adults] || room.price)}
                                                    </div>
                                                    <div className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">{t('common.perNight')}</div>
                                                </div>
                                            </div>
                                            <p className="text-zinc-600 :text-zinc-400 font-light leading-relaxed">
                                                {room.description}
                                            </p>
                                            {/* <button className="w-full py-4 border-2 border-brand-charcoal :border-brand-cream text-brand-charcoal :text-brand-cream font-bold uppercase tracking-widest rounded-full hover:bg-brand-charcoal hover:text-white :hover:bg-brand-cream :hover:text-brand-charcoal transition-all shadow-md">
                                                Select this room
                                            </button> */}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center animate-fade-up">
                            <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-zinc-800 :text-zinc-200 mb-2 uppercase">{t('property.noRoomsMatch')}</h3>
                            <p className="text-zinc-500 font-light">{t('property.tryDifferentSearch')}</p>
                        </div>
                    )}
                </section>


                {/* Description and Stats */}
                <section className="py-20 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 border-b border-brand-gold/10 overflow-hidden">
                    <ScrollReveal className="lg:col-span-2 space-y-6">
                        <h2 className="text-3xl font-serif text-brand-charcoal :text-brand-cream uppercase tracking-wide">{t('property.aboutRetreat')}</h2>
                        <p className="text-lg text-zinc-600 :text-zinc-400 leading-relaxed font-light">
                            {property.description}
                        </p>
                    </ScrollReveal>
                    <ScrollReveal stagger={0.2} className="bg-white :bg-zinc-900 p-8 rounded-3xl border border-brand-gold/10 shadow-sm">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 :border-zinc-800">
                            <span className="text-zinc-500 uppercase text-xs tracking-widest font-bold">{t('common.rating')}</span>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-xl">{property.rating}</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-brand-gold">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500">{t('property.startingPrice')}</span>
                                <span className="text-2xl font-bold font-serif" style={{ color: property.ibeHeaderColour || '#CC2229' }}>
                                    {startingPrice ? `${getCurrencySymbol(displayCurrency)} ${convertPrice(startingPrice)}` : `${getCurrencySymbol(displayCurrency)} ${convertPrice(Number(property.price) || 0)}`}
                                </span>
                            </div>
                            <button
                                onClick={() => document.getElementById('room-selection')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full py-4 text-white rounded-full font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                                style={{ backgroundColor: property.ibeHeaderColour || '#CC2229' }}
                            >
                                {t('property.checkRooms')}
                            </button>
                        </div>
                    </ScrollReveal>
                </section>


            </main>

            {!isHeadless && <Footer />}
            {/* <PromoToast /> */}
        </div>
        </>
    );
};

export default PropertyDetailPage;