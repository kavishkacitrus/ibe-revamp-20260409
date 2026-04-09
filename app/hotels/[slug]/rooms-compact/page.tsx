'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import ScrollReveal from '@/app/components/ScrollReveal';
import { useEffect, useState, useMemo, useRef } from 'react';
import { fetchPropertyRooms, fetchFullHouseAvailability } from '@/store/slices/propertySlice';
import { fetchHotelRatePlans } from '@/store/slices/ratePlanSlice';
import { fetchRoomAvailability } from '@/store/slices/availabilitySlice';
import { fetchRoomFeatures } from '@/store/slices/roomFeatureSlice';
import { addRoom, removeRoom, clearReservation, setCurrency } from '@/store/slices/reservationSlice';
import { setDates, updateGuests } from '@/store/slices/bookingSlice';
import { fetchMinStay } from '@/store/slices/minStaySlice';
import { selectSelectedCurrency } from '@/store/slices/currencySlice';
import { useTranslation } from '@/hooks/useTranslation';
import { format, parseISO, addDays, eachDayOfInterval, differenceInDays } from 'date-fns';
import ImageSlider from '@/app/components/ImageSlider';

// --- Sub-components ---

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-amber-600';

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md`}>
                <span className="text-sm font-semibold tracking-wide">{message}</span>
                <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const CompactRatePlanRow = ({
    room,
    onAdd,
    guests,
    id,
    roomTypeAvailability,
    checkIn,
    checkOut,
    reservation,
    propertySoldOutDates,
    property,
    allMinStay,
    roomAdults,
    roomChildren,
    roomChildAges,
    effectiveRemainingInventory
}: any) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const selectedCurrency = useAppSelector(selectSelectedCurrency);
    const { exchangeRates } = useAppSelector((state) => state.currency);
    const specificAvailability = id ? (roomTypeAvailability[id] || []).find((a: any) => a.roomTypeId === room.roomTypeId) : null;

    const selectedDates = checkIn && checkOut
        ? eachDayOfInterval({ start: parseISO(checkIn), end: addDays(parseISO(checkOut), -1) })
        : [];

    const stayAvailability = selectedDates.map(d => {
        const dateStr = format(d, "yyyy-MM-dd'T'00:00:00");
        const dayData = specificAvailability?.availability.find((a: any) => a.date.startsWith(dateStr.split('T')[0]));
        return dayData ? dayData.count : (room.availableCount || 5);
    });

    const minStayAvailability = stayAvailability.length > 0 ? Math.min(...stayAvailability) : (room.availableCount || 5);
    const nightsSelected = checkIn && checkOut ? differenceInDays(parseISO(checkOut), parseISO(checkIn)) : 0;
    const roomTypeMinStays = allMinStay.filter((m: any) => m.hotelRoomTypeId === room.roomTypeId);

    const maxRequiredMinStay = selectedDates.reduce((max, date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const minStayItem = roomTypeMinStays.find((m: any) => m.dt.startsWith(dateStr));
        return minStayItem ? Math.max(max, minStayItem.minStay) : max;
    }, 0);

    const isMinStayMet = nightsSelected >= maxRequiredMinStay;
    const roomCount = 1;

    const soldOutDatesInSelection = selectedDates.filter(d => {
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayData = specificAvailability?.availability.find((a: any) => a.date.startsWith(dateStr));
        return propertySoldOutDates.includes(dateStr) ||
            (property?.unavailableDates && property.unavailableDates.includes(dateStr)) ||
            (dayData && dayData.count === 0);
    });
    const isSoldOutInSelection = soldOutDatesInSelection.length > 0;

    let totalDisplayPrice = 0;
    let rateNotAvailable = false;

    const adultsInThisRoom = roomAdults;
    const childrenInThisRoom = roomChildren;
    const agesInThisRoom = [...roomChildAges.slice(0, roomChildren)];

    const effectiveAdults = adultsInThisRoom + agesInThisRoom.filter(age => room.childAgeMax !== undefined && room.childAgeMax !== null && age > room.childAgeMax).length;
    const chargeableChildrenCount = agesInThisRoom.filter(age =>
        room.childAgeMin !== undefined && room.childAgeMin !== null &&
        room.childAgeMax !== undefined && room.childAgeMax !== null &&
        age >= room.childAgeMin && age <= room.childAgeMax
    ).length;

    // Use a helper for consistent price calculation
    const calculatePriceForDate = (date: Date | null) => {
        const dateStr = date ? format(date, 'yyyy-MM-dd') : null;
        const dailyPaxRates = dateStr ? room.rawRates?.[dateStr] : null;

        let baseRate = 0;
        let foundRate = false;

        if (dailyPaxRates && dailyPaxRates[effectiveAdults]) {
            baseRate = dailyPaxRates[effectiveAdults];
            foundRate = true;
        } else if (room.paxRates && room.paxRates[effectiveAdults]) {
            baseRate = room.paxRates[effectiveAdults];
            foundRate = true;
        }

        if (!foundRate) {
            return null;
        }

        return baseRate + (chargeableChildrenCount * (room.childRate || 0));
    };

    if (selectedDates.length > 0) {
        selectedDates.forEach((date, dateIdx) => {
            const priceForDate = calculatePriceForDate(date);
            if (priceForDate === null) {
                rateNotAvailable = true;
            } else if (dateIdx === 0) {
                totalDisplayPrice = priceForDate;
            }
        });
    } else {
        const defaultPrice = calculatePriceForDate(null);
        if (defaultPrice === null) {
            rateNotAvailable = true;
        } else {
            totalDisplayPrice = defaultPrice;
        }
    }

    const displayPrice = rateNotAvailable ? null : totalDisplayPrice;
    const originalPrice = displayPrice ? Math.round(displayPrice * 1.3) : null;

    // Currency conversion
    const roomCurrency = room.currencyCode || 'USD';
    const isSameCurrency = selectedCurrency === roomCurrency;
    const exchangeRateKey = `${roomCurrency}_${selectedCurrency}`;
    const exchangeRate = exchangeRates[exchangeRateKey];
    const convertPrice = (price: number | null): number | null => {
        if (price === null) return null;
        if (isSameCurrency || !exchangeRate) return Math.round(price);
        return Math.round(price * exchangeRate.rate);
    };
    const displayCurrency = (!isSameCurrency && exchangeRate) ? selectedCurrency : roomCurrency;
    const convertedDisplay = convertPrice(displayPrice);
    const convertedOriginal = convertPrice(originalPrice);

    return (
        <div className="py-4 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-zinc-50/50 transition-colors px-2 rounded-lg">
            <div className="flex-1 space-y-2">
                <h4 className="text-base font-bold text-zinc-800 uppercase tracking-tight inline-flex items-center gap-2">
                    <span className="underline decoration-zinc-300 underline-offset-4 cursor-help">{room.type}</span>
                </h4>

                <div className="flex flex-wrap gap-3 mt-1">
                    {(() => {
                        const inclusions = [];
                        const mp = room.type.toUpperCase();
                        if (mp.includes('BREAKFAST') || mp.includes('B&B')) inclusions.push({ label: 'Breakfast Included', icon: '☕' });
                        if (mp.includes('HALF BOARD') || mp.includes('HB')) inclusions.push({ label: 'Breakfast & Dinner', icon: '🍽️' });
                        return inclusions.map((inc, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                                <span>{inc.icon}</span>
                                <span>{inc.label}</span>
                            </div>
                        ));
                    })()}
                </div>
                <p className="text-sm text-zinc-500 italic max-w-md">{room.description}</p>
            </div>

            <div className="flex items-center gap-6 md:gap-10">
                <div className="text-right whitespace-nowrap">
                    {convertedDisplay !== null ? (
                        <>
                            {convertedOriginal && (
                                <div className="text-sm text-zinc-400 line-through font-medium">{displayCurrency} {convertedOriginal}</div>
                            ) || <div className="h-5" />}
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-lg md:text-1xl">
                                    {displayCurrency}{" "}
                                    <span className="text-xl md:text-3xl font-bold text-zinc-900">
                                        {convertedDisplay}
                                    </span>
                                </span>
                            </div>
                            <div className="text-[11px] uppercase text-zinc-500 font-bold tracking-widest mt-1">
                                {t('common.perNight')}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-medium mt-1">
                                {roomAdults} {roomAdults === 1 ? t('common.adult') : t('common.adults')}{roomChildren > 0 && ` & ${roomChildren} ${roomChildren === 1 ? t('common.child') : t('common.children')}`}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-end justify-center h-full gap-2">
                            <span className="text-[10px] text-zinc-400 max-w-[120px] text-right leading-tight">{t('roomsCompact.adjustGuestsOrDates')}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onAdd(room, roomAdults, roomChildren, roomChildAges.slice(0, roomChildren), roomCount)}
                    disabled={isSoldOutInSelection || !isMinStayMet || displayPrice === null || effectiveRemainingInventory <= 0}
                    className={`min-w-[140px] py-3 px-8 rounded font-bold uppercase tracking-widest text-xs transition-all
                        ${isSoldOutInSelection || !isMinStayMet || displayPrice === null || effectiveRemainingInventory <= 0
                            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            : 'text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:transform active:scale-[0.98]'
                        }`}
                    style={!(isSoldOutInSelection || !isMinStayMet || displayPrice === null || effectiveRemainingInventory <= 0) ? { backgroundColor: property?.ibeHeaderColour || '#5B2E83' } : {}}
                >
                    {isSoldOutInSelection || effectiveRemainingInventory <= 0 ? t('roomsCompact.soldOut') : (displayPrice === null ? t('roomsCompact.unavailable') : t('roomsCompact.bookNow'))}
                </button>
            </div>
        </div>
    );
};

const CompactRoomTypeGroup = ({
    roomType,
    ratePlans,
    index,
    id,
    allRoomFeatures,
    getMappedRoom,
    handleAddRoom,
    guests,
    roomTypeAvailability,
    checkIn,
    checkOut,
    reservation,
    propertySoldOutDates,
    property,
    allMinStay
}: any) => {
    const { t } = useTranslation();
    const firstMappedRoom = getMappedRoom(ratePlans[0]);
    const image = firstMappedRoom.image;

    const [showAllFeatures, setShowAllFeatures] = useState(false);

    // Initial occupancy state from global search
    const [roomAdults, setRoomAdults] = useState(guests.adults);
    const [roomChildren, setRoomChildren] = useState(guests.children);
    const [roomChildAges, setRoomChildAges] = useState<number[]>(guests.childAges);

    // Sync when global guests change (but user can still override)
    useEffect(() => {
        setRoomAdults(guests.adults);
        setRoomChildren(guests.children);
        setRoomChildAges(guests.childAges);
    }, [guests]);

    // Max limits from room type data
    const maxAdults = roomType.adultSpace || 2;
    const maxChildren = roomType.childSpace || 0;

    const features = id && allRoomFeatures[id]
        ? allRoomFeatures[id].filter((f: any) => f.hotelRoomTypeID === roomType.hotelRoomTypeID && f.isTrue)
        : [];

    const displayedFeatures = features.slice(0, 8);
    const hasMoreFeatures = features.length > 8;

    return (
        <>
            <ScrollReveal stagger={index * 0.1}>
                <div className="bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden mb-8 flex flex-col p-4 md:p-6">
                    {/* Header Section */}
                    <div className="mb-6 items-start justify-between flex flex-col md:flex-row gap-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-serif text-[#5B2E83] uppercase tracking-wide">
                                {roomType.roomType}
                            </h2>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row gap-10">
                            {/* Left Column: Image & Features (Checkmark style) */}
                            <div className="md:w-1/3 shrink-0">
                                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-inner mb-6 ring-1 ring-zinc-100">
                                    {(() => {
                                        if (!id) return <div className="w-full h-full bg-zinc-100 animate-pulse" />;
                                        const allImages = features
                                            .filter((f: any) => f.hotelRoomTypeImage)
                                            .flatMap((f: any) => f.hotelRoomTypeImage.map((img: any) => img.imageURL));
                                        const uniqueImages = Array.from(new Set(allImages.length > 0 ? allImages : [image])) as string[];
                                        return <ImageSlider images={uniqueImages} alt={roomType.roomType} />;
                                    })()}
                                </div>

                                {/* Room Features - Display as checkmarks (like the image) */}
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide mb-3">
                                        Room Features
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {displayedFeatures.map((feature: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-green-600 text-base font-bold">✔</span>
                                                <span className="text-sm text-zinc-700">{feature.roomFeature.featureName}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {hasMoreFeatures && (
                                        <button 
                                            onClick={() => setShowAllFeatures(true)}
                                            className="text-[#5B2E83] text-xs font-medium mt-3 hover:underline transition-all"
                                        >
                                            + View all {features.length} amenities
                                        </button>
                                    )}
                                    
                                    {/* If no features found */}
                                    {features.length === 0 && (
                                        <p className="text-sm text-zinc-400 italic">No features listed</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Info & Rates */}
                            <div className="flex-1">
                                <div className="space-y-6">
                                    <div className="space-y-2 relative">
                                        {/* Moved to top right corner */}
                                        <div className="absolute top-0 right-0 text-red-700 font-bold text-sm tracking-tight flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                                            {t('roomsCompact.stayInsightHighDemand')}
                                        </div>
                                        
                                        <div className="text-zinc-600 font-medium text-sm border-b border-zinc-100 pb-4">
                                            {t('roomsCompact.sleeps')} {roomType.adultSpace + roomType.childSpace}  •  {features.find((f: any) => f.roomFeature.featureName.toLowerCase().includes('sq m'))?.roomFeature.featureName || t('roomsCompact.premiumRoom')}
                                        </div>
                                    </div>

                                    <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                                        {firstMappedRoom.description || `Experience a blend of familiarity and wonder in our ${roomType.roomType} rooms. Thoughtfully designed for comfort and elegance.`}
                                    </p>

                                    {(() => {
                                        const hotelAvailability = (id && roomTypeAvailability[id]) || [];
                                        const specificAvailability = hotelAvailability.find((a: any) => a.roomTypeId === roomType.hotelRoomTypeID);

                                        const selectedDates = checkIn && checkOut
                                            ? eachDayOfInterval({ start: parseISO(checkIn), end: addDays(parseISO(checkOut), -1) })
                                            : [];

                                        const stayAvailability = selectedDates.map(d => {
                                            const dateStr = format(d, "yyyy-MM-dd'T'00:00:00");
                                            const dayData = specificAvailability?.availability.find((a: any) => a.date.startsWith(dateStr.split('T')[0]));
                                            return dayData ? dayData.count : 5;
                                        });

                                        const minStayAvailability = stayAvailability.length > 0 ? Math.min(...stayAvailability) : 5;
                                        const roomsInReservation = reservation.items.filter((item: any) => item.roomTypeId === roomType.hotelRoomTypeID).length;
                                        const inventory = Math.max(0, minStayAvailability - roomsInReservation);

                                        return (
                                            <div className="flex flex-col gap-4">
                                                {inventory > 0 ? (
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest w-fit
                                                        ${inventory <= 2 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-green-50 border-green-100 text-green-600'}`}>
                                                        <span className={`w-2 h-2 rounded-full ${inventory <= 2 ? 'bg-red-600' : 'bg-green-600'}`}></span>
                                                        {inventory} {inventory === 1 ? t('common.room') : t('common.rooms')} {t('roomsCompact.left')}
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400 text-[10px] font-bold uppercase tracking-widest w-fit">
                                                        <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
                                                        {t('roomsCompact.fullyBooked')}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    <div className="mt-10 overflow-hidden">
                                        {ratePlans.map((plan: any) => {
                                            const mappedRoom = getMappedRoom(plan);
                                            const hotelAvailability = (id && roomTypeAvailability[id]) || [];
                                            const specificAvailability = hotelAvailability.find((a: any) => a.roomTypeId === roomType.hotelRoomTypeID);

                                            const selectedDates = checkIn && checkOut
                                                ? eachDayOfInterval({ start: parseISO(checkIn), end: addDays(parseISO(checkOut), -1) })
                                                : [];

                                            const stayAvailability = selectedDates.map(d => {
                                                const dateStr = format(d, "yyyy-MM-dd'T'00:00:00");
                                                const dayData = specificAvailability?.availability.find((a: any) => a.date.startsWith(dateStr.split('T')[0]));
                                                return dayData ? dayData.count : 5;
                                            });

                                            const minStayAvailability = stayAvailability.length > 0 ? Math.min(...stayAvailability) : 5;
                                            const roomsInReservation = reservation.items.filter((item: any) => item.roomTypeId === roomType.hotelRoomTypeID).length;
                                            const inventory = Math.max(0, minStayAvailability - roomsInReservation);

                                            return (
                                                <CompactRatePlanRow
                                                    key={plan.hotelRatePlanID}
                                                    room={mappedRoom}
                                                    onAdd={handleAddRoom}
                                                    guests={guests}
                                                    id={id}
                                                    roomTypeAvailability={roomTypeAvailability}
                                                    checkIn={checkIn}
                                                    checkOut={checkOut}
                                                    reservation={reservation}
                                                    propertySoldOutDates={propertySoldOutDates}
                                                    property={property}
                                                    allMinStay={allMinStay}
                                                    roomAdults={roomAdults}
                                                    roomChildren={roomChildren}
                                                    roomChildAges={roomChildAges}
                                                    effectiveRemainingInventory={inventory}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Modal for showing all features */}
            {showAllFeatures && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setShowAllFeatures(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                            <div>
                                <h3 className="text-2xl font-serif text-[#5B2E83] uppercase tracking-wide">
                                    {roomType.roomType}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">All Room Amenities</p>
                            </div>
                            <button
                                onClick={() => setShowAllFeatures(false)}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
                                    <path d="M18 6L6 18M6 6L18 18" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body - Scrollable Features List */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                {features.map((feature: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-zinc-50">
                                        <span className="text-green-600 text-lg font-bold">✔</span>
                                        <span className="text-zinc-700">{feature.roomFeature.featureName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowAllFeatures(false)}
                                className="w-full py-3 bg-[#5B2E83] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#4A256A] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const CompactRoomSearchResultsPage = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const isHeadless = searchParams?.get('headless') === 'true';
    const slug = params.slug as string;
    const dispatch = useAppDispatch();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    
    // Add ref for sidebar container
    const sidebarRef = useRef<HTMLDivElement>(null);

    const { properties, propertyRooms, roomsLoading, fullHouseAvailability } = useAppSelector((state) => state.property);
    const { ratePlans, loading: ratePlansLoading } = useAppSelector((state) => state.ratePlan);
    const { availability: roomTypeAvailability, loading: availabilityLoading } = useAppSelector((state) => state.availability);
    const { features: allRoomFeatures, loading: featuresLoading } = useAppSelector((state) => state.roomFeature);
    const { guests, checkIn, checkOut, mealPlan, residency } = useAppSelector((state) => state.booking);
    const reservation = useAppSelector((state) => state.reservation);
    const allMinStaysState = useAppSelector((state) => state.minStay.minStay);
    const selectedCurrency = useAppSelector(selectSelectedCurrency);
    const { exchangeRates } = useAppSelector((state) => state.currency);

    const property = useMemo(() => properties.find(p => p.slug === slug || p.id === Number(slug)), [properties, slug]);
    const id = property?.id;
    const rooms = useMemo(() => id ? (propertyRooms[id] || []) : [], [id, propertyRooms]);
    const propertyRatePlans = useMemo(() => id ? (ratePlans[id] || []) : [], [id, ratePlans]);
    const propertySoldOutDates = useMemo(() => id ? (fullHouseAvailability[id] || []) : [], [id, fullHouseAvailability]);
    const allMinStay = useMemo(() => id ? (allMinStaysState[id] || []) : [], [id, allMinStaysState]);

    // Function to check if viewport is mobile
    const isMobileView = () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 1024; // lg breakpoint
    };

    // Sidebar currency conversion: use the first rate plan's currency as baseCurrency
    const sidebarBaseCurrency = propertyRatePlans.length > 0 ? (propertyRatePlans[0].currencyCode || 'USD') : 'USD';
    const sidebarRateKey = `${sidebarBaseCurrency}_${selectedCurrency}`;
    const sidebarExchangeRate = exchangeRates[sidebarRateKey];
    const sidebarDisplayCurrency = (selectedCurrency !== sidebarBaseCurrency && sidebarExchangeRate) ? selectedCurrency : sidebarBaseCurrency;
    const convertSidebarPrice = (price: number) => {
        if (selectedCurrency === sidebarBaseCurrency || !sidebarExchangeRate) return Math.round(price);
        return Math.round(price * sidebarExchangeRate.rate);
    };

    const totalGuests = guests.adults + guests.children;

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

                // Optionally prune the URL query visually without reloading but we can just leave it
            }
        }
    }, [searchParams, dispatch]);

    useEffect(() => {
        if (id) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const start = checkIn || today.toISOString();
            const end = checkOut || tomorrow.toISOString();

            dispatch(fetchPropertyRooms({ hotelId: id, startDate: start, endDate: end }));
            dispatch(fetchHotelRatePlans({ hotelId: id, isCmActive: false }));
            dispatch(fetchRoomAvailability({ hotelId: id, startDate: start, endDate: end, rateCodeId: 2 }));
            dispatch(fetchRoomFeatures(id));
            if (!fullHouseAvailability[id]) dispatch(fetchFullHouseAvailability(id));
            if (start && end) dispatch(fetchMinStay({ hotelId: id, fromDate: start, toDate: end }));
        }
    }, [id, dispatch, checkIn, checkOut]);

    const ibeRatePlans = useMemo(() => {
        return propertyRatePlans.filter(plan => {
            if (plan.rateCodeID !== 2) return false;
            
            const totalGuests = guests.adults + guests.children;
            const roomType = plan.hotelRoomType;
            const matchesCapacity = totalGuests <= (roomType?.adultSpace || 0) + (roomType?.childSpace || 0);
            
            const mealPlanName = plan.mealPlanMaster?.mealPlan || 'Standard';
            const matchesMealPlan = mealPlan === 'All Meal Plans' || mealPlanName.toLowerCase().includes(mealPlan.toLowerCase());

            // When rate plan currency matches hotel currency, show it for any residency
            const planCurrency = (plan.currencyCode || 'USD').toUpperCase();
            const propertyCurrency = (property?.currencyCode || 'USD').toUpperCase();
            
            let matchesResidency = true;
            if (residency === 'resident') {
                matchesResidency = planCurrency === propertyCurrency;
            } else if (residency === 'non-resident') {
                // If rate plan currency matches hotel currency, show it for non-residents too
                matchesResidency = planCurrency !== propertyCurrency || planCurrency === propertyCurrency;
            }

            return matchesCapacity && matchesMealPlan && matchesResidency;
        });
    }, [propertyRatePlans, totalGuests, mealPlan, residency, property]);

    const groupedRooms = useMemo(() => {
        return ibeRatePlans.reduce((acc, plan) => {
            const roomId = plan.hotelRoomType?.hotelRoomTypeID;
            if (!roomId) return acc;
            if (!acc[roomId]) acc[roomId] = { roomType: plan.hotelRoomType, ratePlans: [] };
            acc[roomId].ratePlans.push(plan);
            return acc;
        }, {} as Record<number, { roomType: any, ratePlans: any[] }>);
    }, [ibeRatePlans]);

    const groupedRoomsArray = useMemo(() => Object.values(groupedRooms), [groupedRooms]);

    const getMappedRoom = (plan: any) => {
        if (!plan) return {};
        const roomType = plan.hotelRoomType;
        const mealPlanName = plan.mealPlanMaster?.mealPlan || 'Standard';
        const propertyRoom = rooms.find((r: any) => r.id === `room-${roomType?.hotelRoomTypeID}-${plan.rateCodeID}`);

        const paxAverages: Record<number, number> = {};
        const rawRates: Record<string, Record<number, number>> = {};
        if (plan.hotelRates && plan.hotelRates.length > 0) {
            plan.hotelRates.forEach((r: any) => {
                const dateStr = r.rateDate.split('T')[0];
                rawRates[dateStr] = {};
                for (let i = 1; i <= 10; i++) if (r[`pax${i}`] != null) rawRates[dateStr][i] = r[`pax${i}`];
            });
            for (let i = 1; i <= 10; i++) {
                let total = 0, count = 0;
                plan.hotelRates.forEach((r: any) => { if (r[`pax${i}`] != null) { total += r[`pax${i}`]; count++; } });
                if (count > 0) paxAverages[i] = Math.round(total / count);
            }
        }
        for (let i = 1; i <= 10; i++) if (plan[`pax${i}`] != null && Object.keys(rawRates).length === 0) paxAverages[i] = plan[`pax${i}`];

        const hotelMaster = Array.isArray(plan.hotelMaster) ? plan.hotelMaster[0] : plan.hotelMaster;

        return {
            id: `plan-${plan.hotelRatePlanID}`,
            name: roomType?.roomType || plan.title,
            type: mealPlanName,
            price: plan.defaultRate,
            paxRates: paxAverages,
            rawRates: rawRates,
            capacity: (roomType?.adultSpace || 0) + (roomType?.childSpace || 0),
            image: propertyRoom?.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
            description: `${mealPlanName} package for ${roomType?.roomType}.`,
            availableCount: propertyRoom?.availableCount ?? 5,
            maxAdults: roomType?.adultSpace || 2,
            maxChildren: roomType?.childSpace || 0,
            roomTypeId: roomType?.hotelRoomTypeID,
            hotelRatePlanID: plan.hotelRatePlanID,
            childRate: plan.childRate || 0,
            childAgeMin: hotelMaster?.childAgeMin,
            childAgeMax: hotelMaster?.childAgeMax,
            currencyCode: plan.currencyCode
        };
    };

    const handleAddRoom = (room: any, adults: number, children: number, childAges: number[], roomCount: number) => {
        const ci = checkIn || new Date().toISOString();
        const co = checkOut || new Date(Date.now() + 86400000).toISOString();
        const stayDates = eachDayOfInterval({ start: parseISO(ci), end: addDays(parseISO(co), -1) });

        let totalStayPrice = 0;
        stayDates.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dailyPaxRates = room.rawRates?.[dateStr];

            const agesInThisRoom = [...childAges];
            const effectiveAdults = adults + agesInThisRoom.filter(age => room.childAgeMax != null && age > room.childAgeMax).length;
            const chargeableChildrenCount = agesInThisRoom.filter(age =>
                room.childAgeMin != null &&
                room.childAgeMax != null &&
                age >= room.childAgeMin && age <= room.childAgeMax
            ).length;

            let baseRate = 0;
            let foundRate = false;

            if (dailyPaxRates && dailyPaxRates[effectiveAdults]) {
                baseRate = dailyPaxRates[effectiveAdults];
                foundRate = true;
            } else if (room.paxRates && room.paxRates[effectiveAdults]) {
                baseRate = room.paxRates[effectiveAdults];
                foundRate = true;
            }

            if (!foundRate) {
                // If a rate fails in the middle of calculation for handleAddRoom, user should theoretically never reach this because button is disabled. 
                // But just in case, we do not add room.price fallback here either.
                return;
            }

            totalStayPrice += baseRate + (chargeableChildrenCount * (room.childRate || 0));
        });

        dispatch(addRoom({
            id: `${room.id}-${Date.now()}`,
            hotelId: id!,
            name: room.name,
            price: totalStayPrice,
            mealPlan: room.type,
            adults: adults,
            children: children,
            childAges: childAges,
            checkIn: ci,
            checkOut: co,
            roomTypeId: room.roomTypeId,
            hotelRatePlanID: room.hotelRatePlanID
        }));

        // Set the currency from the room data
        if (room.currencyCode) {
            dispatch(setCurrency(room.currencyCode));
        }

        setToast({ message: `${room.name} added to your journey`, type: 'success' });

        // Scroll to sidebar on mobile view after adding room
        // Use setTimeout to ensure the DOM has updated with the new room
        setTimeout(() => {
            if (isMobileView() && sidebarRef.current) {
                sidebarRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                // Optional: Add a temporary highlight effect to the sidebar
                const sidebarElement = sidebarRef.current;
                sidebarElement.style.transition = 'box-shadow 0.3s ease';
                sidebarElement.style.boxShadow = '0 0 0 3px rgba(91, 46, 131, 0.3)';
                setTimeout(() => {
                    if (sidebarRef.current) {
                        sidebarRef.current.style.boxShadow = '';
                    }
                }, 1500);
            }
        }, 100);
    };

    const isLoading = roomsLoading || ratePlansLoading || availabilityLoading || !property;

    return (
        <div className="bg-[#FAF9F6] min-h-screen selection:bg-[#5B2E83] selection:text-white pb-12 font-sans">
            {!isHeadless && <Header />}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className={`container mx-auto px-4 md:px-8 ${isHeadless ? 'pt-8' : 'pt-28'}`}>
                <ScrollReveal className="mb-12 relative z-50">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-200">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-serif text-[#1D2B5B] uppercase tracking-tight">{t('roomsCompact.chooseYourExperience')}</h1>
                            <div className="flex items-center gap-4">
                                <p className="text-zinc-500 font-medium">{t('roomsCompact.explorePremiumRooms', { hotelName: property?.name })}</p>
                            </div>
                        </div>
                        {id && <SearchBar hotelId={id} unavailableDates={property?.unavailableDates || []} />}
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        {isLoading ? (
                            <div className="space-y-12 animate-pulse">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white rounded-xl h-[400px] shadow-sm border border-zinc-100" />
                                ))}
                            </div>
                        ) : groupedRoomsArray.length > 0 ? (
                            <div className="space-y-4">
                                {groupedRoomsArray.map((group, index) => (
                                    <CompactRoomTypeGroup
                                        key={group.roomType.hotelRoomTypeID}
                                        roomType={group.roomType}
                                        ratePlans={group.ratePlans}
                                        index={index}
                                        id={id}
                                        allRoomFeatures={allRoomFeatures}
                                        getMappedRoom={getMappedRoom}
                                        handleAddRoom={handleAddRoom}
                                        guests={guests}
                                        roomTypeAvailability={roomTypeAvailability}
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        reservation={reservation}
                                        propertySoldOutDates={propertySoldOutDates}
                                        property={property}
                                        allMinStay={allMinStay}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-white rounded-2xl border border-zinc-200 shadow-sm">
                                <h3 className="text-2xl font-serif text-zinc-800 mb-2">{t('roomsCompact.notAvailable')}</h3>
                                <p className="text-zinc-500">{t('roomsCompact.tryDifferentDatesOrContact')}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary - Added ref here */}
                    <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
                        <div 
                            ref={sidebarRef}
                            className="bg-white rounded-xl p-8 border border-zinc-200 shadow-xl space-y-8"
                        >
                            <h2 className="text-2xl font-serif text-[#1D2B5B] uppercase tracking-tight border-b border-zinc-100 pb-4">
                                {t('roomsCompact.yourSelection')}
                            </h2>

                            {reservation.items.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {reservation.items.map((item, index) => (
                                            <div key={item?.id} className="flex justify-between items-start gap-4 p-4 bg-zinc-50 rounded-lg group relative">
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">{t('common.room')} {index + 1}</div>
                                                    <div className="font-bold text-base text-zinc-900 uppercase">{item?.name}</div>
                                                    <div className="text-sm text-zinc-500 mt-1 flex gap-2">
                                                        <span>{item?.mealPlan}</span>
                                                        <span>•</span>
                                                        <span>{item?.adults} {item?.adults === 1 ? t('common.adult') : t('common.adults')} {item?.children > 0 && `& ${item?.children} ${item?.children === 1 ? t('common.child') : t('common.children')}`}</span>
                                                    </div>
                                                    <div className="text-sm text-zinc-600 mt-1">
                                                        {item?.checkIn && item?.checkOut ? (
                                                            <span>
                                                                {format(parseISO(item.checkIn), 'MMM dd')} - {format(parseISO(item.checkOut), 'MMM dd, yyyy')}
                                                            </span>
                                                        ) : (
                                                            <span>{t('roomsCompact.selectDates')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <button
                                                        onClick={() => dispatch(removeRoom(item?.id))}
                                                        className="text-zinc-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6L18 18" /></svg>
                                                    </button>
                                                </div>
                                                {/* Price in right-bottom corner */}
                                                <div className="absolute bottom-3 right-3 text-base font-bold text-[#5B2E83]">
                                                    {sidebarDisplayCurrency} {convertSidebarPrice(item?.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-zinc-100 flex justify-between items-end">
                                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">{t('roomsCompact.totalValue')}</div>
                                        <div className="text-right">
                                            <div className="text-3xl font-serif font-bold text-[#1D2B5B]">
                                                <span className="text-lg mr-1">{sidebarDisplayCurrency}</span>
                                                {convertSidebarPrice(reservation.totalAmount)}
                                                </div>
                                            {/* <div className="text-[10px] text-zinc-400 font-medium">Incl. all taxes</div> */}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/checkout${isHeadless ? '?headless=true' : ''}`}
                                        className="w-full py-4 text-white text-center rounded-lg font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:transform active:scale-[0.98] transition-all shadow-lg block"
                                        style={{ backgroundColor: property?.ibeHeaderColour || '#5B2E83' }}
                                    >
                                        {t('roomsCompact.confirmReservation')}
                                    </Link>
                                    <button
                                        onClick={() => { dispatch(clearReservation()); setToast({ message: t('roomsCompact.allRoomsCleared'), type: 'info' }); }}
                                        className="w-full text-zinc-400 hover:text-zinc-600 text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 transition-colors pt-2"
                                    >
                                        {t('roomsCompact.clearAllSelections')}
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-zinc-400 italic text-sm">
                                    {t('roomsCompact.basketEmpty')}
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

export default CompactRoomSearchResultsPage;