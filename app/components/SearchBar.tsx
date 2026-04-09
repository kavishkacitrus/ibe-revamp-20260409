'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDestination, setDates, updateGuests, setMealPlan, setResidency } from '@/store/slices/bookingSlice';
import { clearReservation } from '@/store/slices/reservationSlice';
import { fetchHotelRatePlans } from '@/store/slices/ratePlanSlice';
import AdvancedCalendar from './AdvancedCalendar';
import { format, parseISO, isValid } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

const staticMealPlans = [
    { id: 'all', name: 'All Meal Plans' },
    { id: 'room-only', name: 'Room Only' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'half-board', name: 'Half Board' },
    { id: 'full-board', name: 'Full Board' },
    { id: 'all-inclusive', name: 'All Inclusive' }
];

const SearchBarInner = ({ hotelId, unavailableDates = [] }: { hotelId?: number, unavailableDates?: string[] }) => {
    const searchParams = useSearchParams();
    const isHeadless = searchParams?.get('headless') === 'true';
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { destination, checkIn, checkOut, guests, mealPlan, residency } = useAppSelector((state) => state.booking);
    const { ratePlans } = useAppSelector((state) => state.ratePlan);
    const { properties } = useAppSelector((state) => state.property);

    const property = hotelId ? properties.find(p => p.id === hotelId) : null;

    const [isGuestsOpen, setIsGuestsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isMealPlanOpen, setIsMealPlanOpen] = useState(false);
    const [isResidencyOpen, setIsResidencyOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const guestsRef = useRef<HTMLDivElement>(null);
    const mealPlanRef = useRef<HTMLDivElement>(null);
    const residencyRef = useRef<HTMLDivElement>(null);

    // Calculate dynamic max capacities based on the rate plans for the current hotel
    const propertyRatePlans = hotelId && ratePlans[hotelId] ? ratePlans[hotelId] : [];
    const validRatePlans = propertyRatePlans.filter(plan => plan.rateCodeID === 2);

    // Fetch rate plans if not already loaded for this hotel
    useEffect(() => {
        if (hotelId && !ratePlans[hotelId]) {
            dispatch(fetchHotelRatePlans({ hotelId, isCmActive: false }));
        }
    }, [hotelId, dispatch, ratePlans]);

    // Compute dynamic meal plans based on rate plans
    const availableMealPlans = React.useMemo(() => {
        if (!hotelId || validRatePlans.length === 0) return staticMealPlans;

        const dynamicPlansSet = new Set<string>();
        validRatePlans.forEach(plan => {
            if (plan.mealPlanMaster?.mealPlan) {
                dynamicPlansSet.add(plan.mealPlanMaster.mealPlan);
            }
        });

        const dynamicPlansList = Array.from(dynamicPlansSet).map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name
        }));

        return [
            { id: 'all', name: 'All Meal Plans' },
            ...dynamicPlansList
        ];
    }, [hotelId, validRatePlans]);

    const maxAdults = validRatePlans.length > 0
        ? Math.max(...validRatePlans.map(p => p.hotelRoomType?.adultSpace || 0))
        : 10;

    const maxChildren = validRatePlans.length > 0
        ? Math.max(...validRatePlans.map(p => p.hotelRoomType?.childSpace || 0))
        : 10;

    // Close popovers on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
            if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
                setIsGuestsOpen(false);
            }
            if (mealPlanRef.current && !mealPlanRef.current.contains(event.target as Node)) {
                setIsMealPlanOpen(false);
            }
            if (residencyRef.current && !residencyRef.current.contains(event.target as Node)) {
                setIsResidencyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDateDisplay = (dateStr: string | null, placeholder: string) => {
        if (!dateStr) return placeholder;
        const date = parseISO(dateStr);
        return isValid(date) ? format(date, 'MMM dd, yyyy') : placeholder;
    };

    const formatDateRangeDisplay = () => {
        if (!checkIn) return 'Add dates';
        const start = parseISO(checkIn);
        const end = checkOut ? parseISO(checkOut) : null;

        if (!isValid(start)) return 'Add dates';

        if (end && isValid(end)) {
            return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
        }

        return format(start, 'MMM dd, yyyy');
    };

    const handleSearch = () => {
        // Persist selected dates to localStorage so they survive browser restarts
        try {
            if (checkIn) {
                localStorage.setItem('hotelmate_checkIn', checkIn);
            } else {
                localStorage.removeItem('hotelmate_checkIn');
            }
            if (checkOut) {
                localStorage.setItem('hotelmate_checkOut', checkOut);
            } else {
                localStorage.removeItem('hotelmate_checkOut');
            }
        } catch {
            // localStorage unavailable (e.g. private browsing restrictions) — fail silently
        }

        if (hotelId) {
            const property = properties.find(p => p.id === hotelId);
            router.push(`/hotels/${property?.slug || hotelId}/rooms-compact${isHeadless ? '?headless=true' : ''}`);
        } else {
            router.push(`/hotels?destination=${encodeURIComponent(destination)}`);
        }
    };

    return (
        <div className="p-2 md:p-3 bg-white :bg-zinc-950 border border-zinc-200 :border-zinc-800 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 relative">
            {/* Destination */}
            {!hotelId && (
                <>
                    <div className="flex-[1.2] px-6 py-3 cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-900 rounded-2xl md:rounded-full transition-colors group">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Where</label>
                        <div className="flex items-center w-full relative">
                            <input
                                type="text"
                                placeholder="Search locations or hotels"
                                className="w-full bg-transparent border-none p-0 text-sm font-medium text-zinc-900 :text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                                value={destination}
                                onChange={(e) => dispatch(setDestination(e.target.value))}
                            />
                            {destination && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(setDestination(''));
                                    }}
                                    className="absolute right-0 p-1 text-zinc-400 hover:text-zinc-600 :hover:text-zinc-200 transition-colors"
                                    title="Clear search"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-zinc-200 :bg-zinc-800 mx-1"></div>
                </>
            )}

            {/* Dates Selection Trigger */}
            <div
                className="flex-[1.5] flex items-stretch md:items-center relative"
                ref={calendarRef}
            >
                {hotelId ? (
                    // Combined Dates for Property Page
                    <div
                        className="flex-1 px-6 py-3 cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-900 rounded-2xl md:rounded-full transition-colors"
                        data-testid="calendar-trigger"
                        onClick={() => {
                            setIsCalendarOpen(!isCalendarOpen);
                            setIsGuestsOpen(false);
                            setIsMealPlanOpen(false);
                        }}
                    >
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Dates</label>
                        <div className="text-sm font-medium text-zinc-900 :text-zinc-100 truncate">
                            {formatDateRangeDisplay()}
                        </div>
                    </div>
                ) : (
                    // Separate Dates for Home Page
                    <>
                        <div
                            className="flex-1 px-6 py-3 cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-900 rounded-2xl md:rounded-l-full transition-colors"
                            onClick={() => {
                                setIsCalendarOpen(!isCalendarOpen);
                                setIsGuestsOpen(false);
                            }}
                        >
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Check in</label>
                            <div className="text-sm font-medium text-zinc-900 :text-zinc-100 truncate">
                                {formatDateDisplay(checkIn, 'Add dates')}
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-zinc-200 :bg-zinc-800 flex-shrink-0"></div>

                        <div
                            className="flex-1 px-6 py-3 cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-900 rounded-2xl md:rounded-r-full transition-colors"
                            onClick={() => {
                                setIsCalendarOpen(!isCalendarOpen);
                                setIsGuestsOpen(false);
                            }}
                        >
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Check out</label>
                            <div className="text-sm font-medium text-zinc-900 :text-zinc-100 truncate">
                                {formatDateDisplay(checkOut, 'Add dates')}
                            </div>
                        </div>
                    </>
                )}

                {/* Advanced Calendar Popover */}
                {isCalendarOpen && (
                    <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-2 md:mt-4 z-[100] w-[calc(100vw-32px)] md:w-screen md:max-w-[700px] mx-auto md:mx-0">
                        <AdvancedCalendar
                            hotelId={hotelId}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            selectedMealPlan={mealPlan}
                            unavailableDates={unavailableDates}
                            onSelect={(dates) => {
                                // Clear all room selections when dates change
                                dispatch(clearReservation());
                                dispatch(setDates(dates));
                                // Auto-close if both are selected
                                if (dates.checkIn && dates.checkOut) {
                                    setTimeout(() => setIsCalendarOpen(false), 300);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="hidden md:block w-px h-10 bg-zinc-200 :bg-zinc-800 mx-1"></div>

            {/* Guests */}
            <div
                className="flex-1 px-6 py-3 cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-900 rounded-2xl md:rounded-full transition-colors relative"
                onClick={() => {
                    setIsGuestsOpen(!isGuestsOpen);
                    setIsCalendarOpen(false);
                    setIsMealPlanOpen(false);
                    setIsResidencyOpen(false);
                }}
                ref={guestsRef}
            >
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Who</label>
                <div className="text-sm font-medium text-zinc-900 :text-zinc-100 truncate">
                    {/* {guests.adults + guests.children} guests, {guests.rooms} room */}
                    {guests.adults + guests.children} guests
                </div>

                {isGuestsOpen && (
                    <div className="absolute top-full right-0 mt-4 w-72 bg-white :bg-zinc-950 border border-zinc-200 :border-zinc-800 rounded-3xl shadow-2xl p-6 z-[100] animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-zinc-900 :text-zinc-100 text-sm italic">Adults</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Ages 13+</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        className="w-8 h-8 rounded-full border border-zinc-200 :border-zinc-800 flex items-center justify-center hover:bg-zinc-50 text-brand-gold font-bold"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(updateGuests({ adults: Math.max(1, guests.adults - 1) }));
                                        }}
                                    >-</button>
                                    <span className="w-4 text-center text-sm font-bold">{guests.adults}</span>
                                    <button
                                        className="w-8 h-8 rounded-full border border-zinc-200 :border-zinc-800 flex items-center justify-center hover:bg-zinc-50 text-brand-gold font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(updateGuests({ adults: Math.min(maxAdults, guests.adults + 1) }));
                                        }}
                                        disabled={guests.adults >= maxAdults}
                                    >+</button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-zinc-900 :text-zinc-100 text-sm italic">Children</div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Ages 2-12</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            className="w-8 h-8 rounded-full border border-zinc-200 :border-zinc-800 flex items-center justify-center hover:bg-zinc-50 text-brand-gold font-bold"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(updateGuests({ children: Math.max(0, guests.children - 1) }));
                                            }}
                                        >-</button>
                                        <span className="w-4 text-center text-sm font-bold">{guests.children}</span>
                                        <button
                                            className="w-8 h-8 rounded-full border border-zinc-200 :border-zinc-800 flex items-center justify-center hover:bg-zinc-50 text-brand-gold font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(updateGuests({ children: Math.min(maxChildren, guests.children + 1) }));
                                            }}
                                            disabled={guests.children >= maxChildren}
                                        >+</button>
                                    </div>
                                </div>

                                {guests.children > 0 && (
                                    <div className="space-y-3 pt-2 border-t border-zinc-100 :border-zinc-800">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Child Ages</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {guests.childAges.map((age, idx) => (
                                                <div key={idx} className="flex flex-col gap-1">
                                                    <span className="text-[9px] text-zinc-500 uppercase tracking-tight">Child {idx + 1}</span>
                                                    <select
                                                        value={age}
                                                        onChange={(e) => {
                                                            const newAges = [...guests.childAges];
                                                            newAges[idx] = Number(e.target.value);
                                                            dispatch(updateGuests({ childAges: newAges }));
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full bg-zinc-50 :bg-zinc-900 border border-zinc-200 :border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-900 :text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                                                    >
                                                        {[...Array(12)].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>{i + 1} years</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Meal Plan (Only for Property Page) */}
            {hotelId && (
                <>
                    <div className="hidden md:block w-px h-10 bg-zinc-200 :bg-zinc-800 mx-1"></div>
                    <div
                        className="flex-1 px-6 py-3 cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-900 rounded-2xl md:rounded-full transition-colors relative"
                        onClick={() => {
                            setIsMealPlanOpen(!isMealPlanOpen);
                            setIsCalendarOpen(false);
                            setIsGuestsOpen(false);
                            setIsResidencyOpen(false);
                        }}
                        ref={mealPlanRef}
                    >
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Meal Plan</label>
                        <div className="text-sm font-medium text-zinc-900 :text-zinc-100 truncate italic">
                            {mealPlan}
                        </div>

                        {isMealPlanOpen && (
                            <div className="absolute top-full right-0 mt-4 w-56 bg-white :bg-zinc-950 border border-zinc-200 :border-zinc-800 rounded-3xl shadow-2xl py-4 z-[100] animate-in fade-in slide-in-from-top-2">
                                {availableMealPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="px-6 py-2 hover:bg-zinc-50 :hover:bg-zinc-900 text-sm font-medium text-zinc-900 :text-zinc-100 cursor-pointer transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(setMealPlan(plan.name));
                                            setIsMealPlanOpen(false);
                                        }}
                                    >
                                        {plan.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block w-px h-10 bg-zinc-200 :bg-zinc-800 mx-1"></div>

                    {/* Residency Selection */}
                    <div
                        className="flex-1 px-6 py-3 cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-900 rounded-2xl md:rounded-full transition-colors relative"
                        onClick={() => {
                            setIsResidencyOpen(!isResidencyOpen);
                            setIsCalendarOpen(false);
                            setIsGuestsOpen(false);
                            setIsMealPlanOpen(false);
                        }}
                        ref={residencyRef}
                    >
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Residency</label>
                        <div className="text-sm font-medium text-zinc-900 :text-zinc-100 truncate italic">
                            {residency === 'resident' ? 'Resident' : 'Non-Resident'}
                        </div>

                        {isResidencyOpen && (
                            <div className="absolute top-full right-0 mt-4 w-56 bg-white :bg-zinc-950 border border-zinc-200 :border-zinc-800 rounded-3xl shadow-2xl py-4 z-[100] animate-in fade-in slide-in-from-top-2">
                                <div
                                    className="px-6 py-2 hover:bg-zinc-50 :hover:bg-zinc-900 text-sm font-medium text-zinc-900 :text-zinc-100 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(setResidency('resident'));
                                        setIsResidencyOpen(false);
                                    }}
                                >
                                    Resident
                                </div>
                                <div
                                    className="px-6 py-2 hover:bg-zinc-50 :hover:bg-zinc-900 text-sm font-medium text-zinc-900 :text-zinc-100 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(setResidency('non-resident'));
                                        setIsResidencyOpen(false);
                                    }}
                                >
                                    Non-Resident
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={!!hotelId && (!checkIn || !checkOut)}
                className={`cursor-pointer md:ml-2 h-12 md:h-14 px-8 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-xl group ${!!hotelId && (!checkIn || !checkOut)
                    ? 'bg-zinc-200 :bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'
                    : 'text-white hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                style={!(!!hotelId && (!checkIn || !checkOut)) ? { backgroundColor: property?.ibeHeaderColour || '#B18B8B' } : {}}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${!hotelId || (checkIn && checkOut) ? 'group-hover:rotate-12' : ''} transition-transform`}>
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="uppercase text-xs tracking-[0.2em]">Explore</span>
            </button>
        </div>
    );
};

const SearchBar = (props: { hotelId?: number, unavailableDates?: string[] }) => {
    return (
        <Suspense fallback={<div className="h-14 w-full animate-pulse bg-white/50 rounded-full shadow-lg"></div>}>
            <SearchBarInner {...props} />
        </Suspense>
    );
};

export default SearchBar;
