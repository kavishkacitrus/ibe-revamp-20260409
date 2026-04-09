'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchPropertyRooms, fetchFullHouseAvailability } from '@/store/slices/propertySlice';
import { fetchHotelRatePlans } from '@/store/slices/ratePlanSlice';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isBefore,
    isAfter,
    startOfToday,
    parseISO,
    isValid
} from 'date-fns';

interface AdvancedCalendarProps {
    hotelId?: number;
    checkIn: string | null;
    checkOut: string | null;
    onSelect: (dates: { checkIn: string | null; checkOut: string | null }) => void;
    unavailableDates?: string[];
    selectedMealPlan?: string;
}

const AdvancedCalendar = ({ hotelId, checkIn, checkOut, onSelect, unavailableDates = [], selectedMealPlan }: AdvancedCalendarProps) => {
    const dispatch = useAppDispatch();

    // Initialize current month based on check-in date if valid, otherwise today
    const initialMonth = useMemo(() => {
        if (checkIn) {
            const date = parseISO(checkIn);
            if (isValid(date)) return date;
        }
        return new Date();
    }, [checkIn]);

    const [currentMonth, setCurrentMonth] = useState(initialMonth);
    const [secondMonth, setSecondMonth] = useState(addMonths(initialMonth, 1));
    const today = startOfToday();
    
    // Add a key to force calendar re-render when selection changes
    const [calendarKey, setCalendarKey] = useState(0);
    
    // Temporary selection state for two-click selection
    const [tempCheckIn, setTempCheckIn] = useState<string | null>(checkIn);
    const [tempCheckOut, setTempCheckOut] = useState<string | null>(checkOut);

    const { dailyRates, fullHouseAvailability } = useAppSelector((state) => state.property);
    const { ratePlans } = useAppSelector((state) => state.ratePlan);
    const { guests } = useAppSelector((state) => state.booking);

    const propertyDailyRatesFromProperty = hotelId ? dailyRates[hotelId] || {} : {};
    const propertyRatePlans = hotelId ? ratePlans[hotelId] || [] : [];
    const propertySoldOutDates = hotelId ? fullHouseAvailability[hotelId] || [] : [];

    const propertyDailyRates = useMemo(() => {
        const rates: Record<string, any> = {};

        // Initialize with availability from propertySlice (availability endpoint)
        for (const [date, info] of Object.entries(propertyDailyRatesFromProperty)) {
            rates[date] = {
                available: info.available,
                lowestRate: Infinity,
                paxRates: {}
            };
        }

        // Filter rate plans by rateCodeID === 2 (IBE rate plans)
        let validPlans = propertyRatePlans.filter(plan => plan.rateCodeID === 2);

        // Filter by selected meal plan if provided and not "All"
        if (selectedMealPlan && !selectedMealPlan.toLowerCase().includes('all')) {
            validPlans = validPlans.filter(plan =>
                plan.mealPlanMaster?.mealPlan?.toLowerCase() === selectedMealPlan.toLowerCase()
            );
        }

        // Calculate the lowest rate for each date across all valid plans
        validPlans.forEach(plan => {
            if (plan.hotelRates) {
                plan.hotelRates.forEach(rate => {
                    if (!rate.rateDate) return;
                    const dateStr = rate.rateDate.split('T')[0];

                    // If we don't have availability info for this date, assume it's available for now
                    if (!rates[dateStr]) {
                        rates[dateStr] = {
                            available: true,
                            lowestRate: Infinity,
                            paxRates: {}
                        };
                    }

                    // Update lowest rate for the day
                    if (rate.defaultRate < rates[dateStr].lowestRate) {
                        rates[dateStr].lowestRate = rate.defaultRate;
                    }

                    // Update pax rates if they are lower than current ones
                    for (let i = 1; i <= 10; i++) {
                        const val = rate[`pax${i}`];
                        if (val !== null && val !== undefined) {
                            if (rates[dateStr].paxRates[i] === undefined || val < rates[dateStr].paxRates[i]) {
                                rates[dateStr].paxRates[i] = val;
                            }
                        }
                    }
                });
            }
        });

        return rates;
    }, [propertyDailyRatesFromProperty, propertyRatePlans, selectedMealPlan]);

    const checkInDate = tempCheckIn ? parseISO(tempCheckIn) : null;
    const checkOutDate = tempCheckOut ? parseISO(tempCheckOut) : null;

    // Drag selection state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Date | null>(null);
    const [dragHover, setDragHover] = useState<Date | null>(null);

    // Fetch rates and full house availability
    const fetchedMonthsRef = useRef<Set<string>>(new Set());
    const hasFetchedFullHouse = useRef(false);

    useEffect(() => {
        if (hotelId) {
            // Fetch full house availability exactly once
            if (!hasFetchedFullHouse.current) {
                hasFetchedFullHouse.current = true;
                dispatch(fetchFullHouseAvailability(hotelId));
                dispatch(fetchHotelRatePlans({ hotelId, isCmActive: false }));
            }

            // Fetch for current month
            const currentMonthKey = format(currentMonth, 'yyyy-MM');
            if (!fetchedMonthsRef.current.has(currentMonthKey)) {
                fetchedMonthsRef.current.add(currentMonthKey);

                const start = format(startOfMonth(currentMonth), "yyyy-MM-dd'T'00:00:00");
                const end = format(endOfMonth(currentMonth), "yyyy-MM-dd'T'23:59:59");

                dispatch(fetchPropertyRooms({ hotelId, startDate: start, endDate: end }));
            }

            // Fetch for second month
            const secondMonthKey = format(secondMonth, 'yyyy-MM');
            if (!fetchedMonthsRef.current.has(secondMonthKey)) {
                fetchedMonthsRef.current.add(secondMonthKey);

                const start = format(startOfMonth(secondMonth), "yyyy-MM-dd'T'00:00:00");
                const end = format(endOfMonth(secondMonth), "yyyy-MM-dd'T'23:59:59");

                dispatch(fetchPropertyRooms({ hotelId, startDate: start, endDate: end }));
            }
        }
    }, [hotelId, currentMonth, secondMonth, dispatch]);

    // Sync temporary selection with props when they change externally
    useEffect(() => {
        setTempCheckIn(checkIn);
        setTempCheckOut(checkOut);
    }, [checkIn, checkOut]);

    const getRateInfo = useCallback((date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return propertyDailyRates[dateStr];
    }, [propertyDailyRates]);

    const generateRate = useCallback((date: Date) => {
        const rateInfo = getRateInfo(date);
        if (rateInfo) {
            const totalPax = guests.adults + guests.children;
            const roomCount = guests.rooms || 1;
            const paxPerRoom = Math.max(1, Math.ceil(totalPax / roomCount));

            if (rateInfo.paxRates && rateInfo.paxRates[paxPerRoom]) {
                return rateInfo.paxRates[paxPerRoom];
            }
            if (rateInfo.lowestRate && rateInfo.lowestRate !== Infinity) {
                return rateInfo.lowestRate;
            }

            // Fallback to lowest available pax rate if defaultRate/lowestRate is missing
            const availablePaxRates = Object.values(rateInfo.paxRates) as number[];
            if (availablePaxRates.length > 0) {
                return Math.min(...availablePaxRates);
            }
        }
        return null;
    }, [getRateInfo, guests.adults, guests.children, guests.rooms]);

    const isDateSoldOut = useCallback((date: Date): boolean => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const rateInfo = getRateInfo(date);
        return unavailableDates.includes(dateStr) || 
               propertySoldOutDates.includes(dateStr) || 
               (rateInfo && rateInfo.available === false);
    }, [unavailableDates, propertySoldOutDates, getRateInfo]);

    const handleDateClick = useCallback((date: Date) => {
        // Prevent selection of past dates
        if (isBefore(date, today)) return;
        
        // Prevent selection of sold out dates
        if (isDateSoldOut(date)) return;
        
        const dateStr = format(date, 'yyyy-MM-dd');

        // Case 1: No temporary check-in selected yet
        if (!tempCheckIn) {
            // First click - set temporary check-in only, don't call onSelect yet
            setTempCheckIn(dateStr);
            setTempCheckOut(null);
            setCalendarKey(prev => prev + 1);
            return;
        }

        // Case 2: Temporary check-in is selected, but no check-out
        if (tempCheckIn && !tempCheckOut) {
            const tempCheckInDate = parseISO(tempCheckIn);
            
            // Clicking on the same day as check-in - clear temporary selection
            if (isSameDay(date, tempCheckInDate)) {
                setTempCheckIn(null);
                setTempCheckOut(null);
                setCalendarKey(prev => prev + 1);
                return;
            }
            
            // Clicking on a date before check-in - make it the new check-in
            if (isBefore(date, tempCheckInDate)) {
                setTempCheckIn(dateStr);
                setTempCheckOut(null);
                setCalendarKey(prev => prev + 1);
                return;
            }
            
            // Clicking on a date after check-in - set as check-out and finalize selection
            // First verify that all dates in between are available
            const rangeDates = eachDayOfInterval({ start: tempCheckInDate, end: date });
            const hasSoldOutInRange = rangeDates.some(d => isDateSoldOut(d));
            
            if (!hasSoldOutInRange) {
                // Now we have both dates - call onSelect with the complete range
                onSelect({ 
                    checkIn: tempCheckIn, 
                    checkOut: dateStr 
                });
                // Update temporary state to match
                setTempCheckOut(dateStr);
                setCalendarKey(prev => prev + 1);
            }
            return;
        }

        // Case 3: Both temporary check-in and check-out are selected (shouldn't happen normally, but handle it)
        if (tempCheckIn && tempCheckOut) {
            // Start fresh selection with this date as check-in
            setTempCheckIn(dateStr);
            setTempCheckOut(null);
            setCalendarKey(prev => prev + 1);
            return;
        }
    }, [tempCheckIn, tempCheckOut, today, isDateSoldOut, onSelect]);

    const handleMouseDown = useCallback((date: Date) => {
        if (isBefore(date, today)) return;
        if (isDateSoldOut(date)) return;

        setIsDragging(true);
        setDragStart(date);
        setDragHover(date);
    }, [today, isDateSoldOut]);

    const handleMouseEnter = useCallback((date: Date) => {
        if (!isDragging) return;
        setDragHover(date);
    }, [isDragging]);

    const handleMouseUp = useCallback((date: Date) => {
        if (!isDragging || !dragStart) {
            setIsDragging(false);
            setDragStart(null);
            setDragHover(null);
            return;
        }

        const start = isBefore(dragStart, date) ? dragStart : date;
        const end = isBefore(dragStart, date) ? date : dragStart;

        // Ensure start is not in the past
        if (isBefore(start, today)) {
            setIsDragging(false);
            setDragStart(null);
            setDragHover(null);
            return;
        }

        if (isSameDay(start, end)) {
            handleDateClick(start);
        } else {
            // Check if any date in range is sold out
            const range = eachDayOfInterval({ start, end });
            const hasSoldOut = range.some(d => isDateSoldOut(d));

            if (!hasSoldOut) {
                // For drag selection, we can finalize immediately since both dates are selected at once
                onSelect({
                    checkIn: format(start, 'yyyy-MM-dd'),
                    checkOut: format(end, 'yyyy-MM-dd')
                });
                // Update temporary state to match
                setTempCheckIn(format(start, 'yyyy-MM-dd'));
                setTempCheckOut(format(end, 'yyyy-MM-dd'));
                setCalendarKey(prev => prev + 1);
            } else {
                // If contains sold out, just select the start date if valid
                handleDateClick(start);
            }
        }

        setIsDragging(false);
        setDragStart(null);
        setDragHover(null);
    }, [isDragging, dragStart, today, isDateSoldOut, handleDateClick, onSelect]);

    // Add global mouse up listener to stop dragging even if mouse is released outside calendar
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragStart(null);
                setDragHover(null);
            }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    const renderHeader = useCallback(() => {
        const handlePrevious = () => {
            setCurrentMonth(prev => subMonths(prev, 1));
            setSecondMonth(prev => subMonths(prev, 1));
        };

        const handleNext = () => {
            setCurrentMonth(prev => addMonths(prev, 1));
            setSecondMonth(prev => addMonths(prev, 1));
        };

        return (
            <div className="flex items-center justify-between px-3 py-3 border-b border-brand-gold/10">
                <button
                    onClick={handlePrevious}
                    className="p-1.5 hover:bg-zinc-100 :hover:bg-zinc-800 rounded-full transition-colors text-brand-gold"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="flex flex-col md:flex-row md:items-center md:gap-3 text-center">
                    <h2 className="text-sm md:text-base font-serif font-bold text-brand-charcoal :text-brand-cream uppercase tracking-widest">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <h2 className="hidden md:block text-sm md:text-base font-serif font-bold text-brand-charcoal :text-brand-cream uppercase tracking-widest">
                        {format(secondMonth, 'MMMM yyyy')}
                    </h2>
                </div>
                <button
                    onClick={handleNext}
                    className="p-1.5 hover:bg-zinc-100 :hover:bg-zinc-800 rounded-full transition-colors text-brand-gold"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        );
    }, [currentMonth, secondMonth]);

    const renderMonth = useCallback((month: Date) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
        const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="flex-1">
                {/* Week Labels within each month */}
                <div className="grid grid-cols-7 border-b border-brand-gold/5 bg-zinc-50/50 :bg-zinc-900/30">
                    {dateNames.map((day, i) => (
                        <div key={i} className="text-center text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-zinc-100 :bg-zinc-800 border-b border-brand-gold/10">
                    {calendarDays.map((date, i) => {
                        const isSelected = (checkInDate && isSameDay(date, checkInDate)) || (checkOutDate && isSameDay(date, checkOutDate));
                        const isInRange = checkInDate && checkOutDate && isAfter(date, checkInDate) && isBefore(date, checkOutDate);

                        // Drag preview logic
                        const isDragSelected = isDragging && dragStart && dragHover && (
                            (isSameDay(date, dragStart) || isSameDay(date, dragHover)) ||
                            (isAfter(date, isBefore(dragStart, dragHover) ? dragStart : dragHover) &&
                                isBefore(date, isBefore(dragStart, dragHover) ? dragHover : dragStart))
                        );

                        const isToday = isSameDay(date, today);
                        const isPast = isBefore(date, today);
                        const isCurrentMonth = isSameMonth(date, monthStart);
                        const isSoldOut = isDateSoldOut(date);

                        let cellClass = "relative h-11 md:h-16 bg-white :bg-zinc-950 p-1 md:p-2 transition-all cursor-pointer group flex flex-col items-center justify-between select-none ";

                        if (!isCurrentMonth) cellClass += "opacity-20 ";
                        if (isPast || isSoldOut) cellClass += "cursor-not-allowed ";
                        if (isSoldOut && isCurrentMonth) cellClass += "opacity-40 ";
                        if (isSelected || (isDragging && (isSameDay(date, dragStart!) || isSameDay(date, dragHover!)))) cellClass += "!bg-brand-red text-white ";
                        if (isInRange || (isDragging && isDragSelected && !isSameDay(date, dragStart!) && !isSameDay(date, dragHover!))) cellClass += "!bg-brand-red/10 :!bg-brand-red/5 ";

                        return (
                            <div
                                key={`${calendarKey}-${i}-${format(date, 'yyyy-MM-dd')}`}
                                className={cellClass}
                                onMouseDown={() => handleMouseDown(date)}
                                onMouseEnter={() => handleMouseEnter(date)}
                                onMouseUp={() => handleMouseUp(date)}
                            >
                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-brand-charcoal :text-brand-cream'} ${isToday && !isSelected ? 'text-brand-red border-b-2 border-brand-red' : ''} ${isSoldOut && !isSelected ? 'line-through decoration-zinc-400' : ''}`}>
                                    {format(date, 'd')}
                                </span>
                                {!isPast && isCurrentMonth && !isSoldOut && generateRate(date) && (
                                    <span className={`text-[8px] md:text-[9px] font-bold ${isSelected ? 'text-white/80' : 'text-brand-gold'}`}>
                                        ${generateRate(date)}
                                    </span>
                                )}
                                {isSoldOut && isCurrentMonth && (
                                    <span className="text-[6px] md:text-[7px] font-bold text-zinc-400 uppercase tracking-tighter leading-none">
                                        Sold Out
                                    </span>
                                )}
                                {isSelected && (
                                    <div className="absolute top-1 right-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                )}
                                {isInRange && !isSelected && (
                                    <div className="absolute inset-x-0 h-1 bg-brand-red/20 bottom-0"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [checkInDate, checkOutDate, isDragging, dragStart, dragHover, today, isDateSoldOut, generateRate, calendarKey, handleMouseDown, handleMouseEnter, handleMouseUp]);

    const renderCells = useCallback(() => {
        return (
            <div className="hidden md:flex gap-4">
                {renderMonth(currentMonth)}
                {renderMonth(secondMonth)}
            </div>
        );
    }, [currentMonth, secondMonth, renderMonth]);

    const renderMobileCells = useCallback(() => {
        return renderMonth(currentMonth);
    }, [currentMonth, renderMonth]);

    return (
        <div key={calendarKey} className="w-full max-w-[440px] md:max-w-[900px] bg-white :bg-zinc-950 shadow-2xl rounded-3xl overflow-hidden border border-brand-gold/20 animate-in fade-in zoom-in duration-300">
            {renderHeader()}
            <div className="px-1 md:px-2">
                <div className="md:hidden">
                    {renderMobileCells()}
                </div>
                <div className="hidden md:block">
                    {renderCells()}
                </div>
            </div>
            <div className="p-3 flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-brand-red rounded-sm"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-brand-red/10 rounded-sm"></div>
                    <span>Stay Range</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-zinc-200 :bg-zinc-800 rounded-sm line-through decoration-zinc-400"></div>
                    <span>Sold Out</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-brand-gold">USD</span>
                </div>
            </div>
        </div>
    );
};

export default AdvancedCalendar;