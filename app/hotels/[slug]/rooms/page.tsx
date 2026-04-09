'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import SearchBar from '@/app/components/SearchBar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import ScrollReveal from '@/app/components/ScrollReveal';
import { useEffect, useState, useMemo } from 'react';
import { fetchPropertyRooms, fetchFullHouseAvailability } from '@/store/slices/propertySlice';
import { fetchHotelRatePlans } from '@/store/slices/ratePlanSlice';
import { fetchRoomAvailability } from '@/store/slices/availabilitySlice';
import { fetchRoomFeatures } from '@/store/slices/roomFeatureSlice';
import { addRoom, removeRoom, clearReservation } from '@/store/slices/reservationSlice';
import { setDates } from '@/store/slices/bookingSlice';
import { fetchMinStay } from '@/store/slices/minStaySlice';
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

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-brand-red' : 'bg-brand-gold';

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className={`${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-sm`}>
                {type === 'success' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
                <span className="text-sm font-bold uppercase tracking-widest">{message}</span>
                <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const RoomCard = ({
    room,
    index,
    onAdd,
    guests,
    id,
    roomTypeAvailability,
    checkIn,
    checkOut,
    reservation,
    propertySoldOutDates,
    property,
    allMinStay
}: {
    room: any,
    index: number,
    onAdd: (room: any, adults: number, children: number, childAges: number[], roomCount: number) => void,
    guests: any,
    id: number | undefined,
    roomTypeAvailability: any,
    checkIn: string | null,
    checkOut: string | null,
    reservation: any,
    propertySoldOutDates: string[],
    property: any,
    allMinStay: any[]
}) => {
    const dispatch = useAppDispatch();
    const [roomAdults, setRoomAdults] = useState(guests.adults);
    const [roomChildren, setRoomChildren] = useState(guests.children);
    const [roomChildAges, setRoomChildAges] = useState<number[]>(guests.childAges);

    useEffect(() => {
        setRoomAdults(guests.adults);
        setRoomChildren(guests.children);
        setRoomChildAges(guests.childAges);
    }, [guests]);

    const hotelAvailability = id ? (roomTypeAvailability[id] || []) : [];
    const specificAvailability = hotelAvailability.find((a: any) => a.roomTypeId === room.roomTypeId);

    const selectedDates = checkIn && checkOut
        ? eachDayOfInterval({ start: parseISO(checkIn), end: addDays(parseISO(checkOut), -1) })
        : [];

    const stayAvailability = selectedDates.map(d => {
        const dateStr = format(d, "yyyy-MM-dd'T'00:00:00");
        const dayData = specificAvailability?.availability.find((a: any) => a.date.startsWith(dateStr.split('T')[0]));
        return dayData ? dayData.count : room.availableCount;
    });

    const minStayAvailability = stayAvailability.length > 0 ? Math.min(...stayAvailability) : room.availableCount;
    const roomsInReservation = reservation.items.filter((item: any) => item.name === room.name).length;
    const effectiveRemainingInventory = Math.max(0, minStayAvailability - roomsInReservation);

    const soldOutDatesInSelection = selectedDates.filter(d => {
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayData = specificAvailability?.availability.find((a: any) => a.date.startsWith(dateStr));
        return propertySoldOutDates.includes(dateStr) ||
            (property?.unavailableDates && property.unavailableDates.includes(dateStr)) ||
            (dayData && dayData.count === 0);
    });
    const isSoldOutInSelection = soldOutDatesInSelection.length > 0;

    const nightsSelected = checkIn && checkOut ? differenceInDays(parseISO(checkOut), parseISO(checkIn)) : 0;
    const roomTypeMinStays = allMinStay.filter(m => m.hotelRoomTypeId === room.roomTypeId);

    const maxRequiredMinStay = selectedDates.reduce((max, date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const minStayItem = roomTypeMinStays.find((m: any) => m.dt.startsWith(dateStr));
        return minStayItem ? Math.max(max, minStayItem.minStay) : max;
    }, 0);

    const isMinStayMet = nightsSelected >= maxRequiredMinStay;

    const roomCount = guests.rooms || 1;
    let totalDisplayPrice = 0;
    let rateNotAvailable = false;

    let tempAdults = roomAdults;
    let tempChildren = roomChildren;
    let tempAges = [...roomChildAges.slice(0, roomChildren)];

    for (let i = 0; i < roomCount; i++) {
        const adultsInThisRoom = Math.ceil(tempAdults / (roomCount - i));
        const childrenInThisRoom = Math.ceil(tempChildren / (roomCount - i));
        const agesInThisRoom = tempAges.splice(0, childrenInThisRoom);

        tempAdults -= adultsInThisRoom;
        tempChildren -= childrenInThisRoom;

        const effectiveAdults = adultsInThisRoom + agesInThisRoom.filter(age => room.childAgeMax !== undefined && room.childAgeMax !== null && age > room.childAgeMax).length;
        const chargeableChildrenCount = agesInThisRoom.filter(age =>
            room.childAgeMin !== undefined && room.childAgeMin !== null &&
            room.childAgeMax !== undefined && room.childAgeMax !== null &&
            age >= room.childAgeMin && age <= room.childAgeMax
        ).length;

        selectedDates.forEach((date, dateIdx) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dailyPaxRates = room.rawRates?.[dateStr];

            if (dailyPaxRates && dailyPaxRates[effectiveAdults]) {
                const baseRate = dailyPaxRates[effectiveAdults];
                const nightPrice = baseRate + (chargeableChildrenCount * room.childRate);
                if (dateIdx === 0) totalDisplayPrice += nightPrice;
            } else if (!dailyPaxRates && room.paxRates && room.paxRates[effectiveAdults]) {
                const baseRate = room.paxRates[effectiveAdults];
                const nightPrice = baseRate + (chargeableChildrenCount * room.childRate);
                if (dateIdx === 0) totalDisplayPrice += nightPrice;
            } else {
                rateNotAvailable = true;
            }
        });

        if (rateNotAvailable) break;
    }

    const displayPrice = rateNotAvailable ? null : totalDisplayPrice;

    return (
        <ScrollReveal stagger={index * 0.1}>
            <div className={`bg-white :bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border ${isSoldOutInSelection ? 'border-brand-red/30 bg-brand-red/5' : 'border-brand-gold/5'}`}>
                <div className="p-4 flex flex-col justify-between">
                    <div>
                        <div className={`flex justify-between items-center mb-2 ${isSoldOutInSelection ? 'opacity-70' : ''}`}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-base md:text-sm font-bold font-serif text-brand-charcoal :text-brand-cream uppercase mb-1">
                                    {room.name} - {room.type.toUpperCase().includes('BASIS') ? room.type : `${room.type} BASIS`}
                                </h3>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(() => {
                                        const inclusions: { label: string; icon: string }[] = [];
                                        const mp = room.type.toUpperCase();
                                        if (mp.includes('BREAKFAST') || mp.includes('B&B') || mp.includes('BED & BREAKFAST')) inclusions.push({ label: 'Breakfast Included', icon: '🍳' });
                                        if (mp.includes('HALF BOARD') || mp.includes('HB')) inclusions.push({ label: 'Breakfast & Dinner', icon: '🍽️' });
                                        else if (mp.includes('FULL BOARD') || mp.includes('FB')) inclusions.push({ label: 'All Meals Included', icon: '🍲' });
                                        else if (mp.includes('DINNER')) inclusions.push({ label: 'Dinner Included', icon: '🌙' });
                                        if (mp.includes('ALL INCLUSIVE') || mp.includes('AI')) inclusions.push({ label: 'All Inclusive', icon: '🥂' });

                                        return inclusions.map((inc, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold font-bold text-[9px] md:text-[8px] uppercase tracking-widest shadow-sm">
                                                <span className="text-xs md:text-[10px]">{inc.icon}</span>
                                                <span>{inc.label}</span>
                                            </div>
                                        ));
                                    })()}
                                    {isSoldOutInSelection && (
                                        <span className="text-[10px] md:text-[8px] font-bold text-brand-red uppercase tracking-widest border border-brand-red/30 px-2 py-1 rounded shadow-sm bg-brand-red/5">Sold Out</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                                {displayPrice !== null ? (
                                    <>
                                        <div className="text-xl md:text-base font-bold font-serif leading-none" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>
                                            {room.currencyCode || 'USD'}{displayPrice}
                                        </div>
                                        <div className="text-[10px] md:text-[8px] uppercase text-zinc-400 font-bold tracking-widest mt-1">
                                            {roomCount > 1 ? `${roomCount} rooms/night` : 'per night'}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-xl md:text-base font-bold font-serif leading-none" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>
                                            Rate Not Available
                                        </div>
                                        <div className="text-[10px] md:text-[8px] uppercase text-zinc-400 font-bold tracking-widest mt-1">
                                            for this occupancy
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {!isMinStayMet && !isSoldOutInSelection && (
                            <div className="mb-4 p-3 bg-brand-gold/5 border border-brand-gold/20 rounded-xl flex items-center gap-3">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-brand-gold">
                                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs md:text-[10px] font-bold text-brand-gold uppercase tracking-tight">
                                    Minimum stay of {maxRequiredMinStay} nights required
                                </span>
                            </div>
                        )}

                        {!isSoldOutInSelection ? (
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] md:text-[8px] uppercase text-zinc-400 font-bold tracking-widest flex items-center gap-1">
                                            <span>Adults</span>
                                            <span className="font-light opacity-60">(Max {room.maxAdults})</span>
                                        </label>
                                        <div className="flex items-center border border-zinc-200 :border-zinc-800 rounded-full bg-zinc-50 :bg-zinc-950/50">
                                            <button onClick={() => setRoomAdults(Math.max(1, roomAdults - 1))} className="px-3 py-1 md:px-2 md:py-0.5 hover:text-brand-red transition-colors text-zinc-400 font-bold text-base md:text-sm disabled:opacity-20" disabled={roomAdults <= 1}>-</button>
                                            <span className={`w-8 md:w-5 text-center text-sm md:text-xs font-bold ${roomAdults >= room.maxAdults ? 'text-brand-red' : 'text-brand-charcoal :text-brand-cream'}`}>{roomAdults}</span>
                                            <button onClick={() => setRoomAdults(Math.min(room.maxAdults, roomAdults + 1))} className="px-3 py-1 md:px-2 md:py-0.5 hover:text-brand-red transition-colors text-zinc-400 font-bold text-base md:text-sm disabled:opacity-20" disabled={roomAdults >= room.maxAdults}>+</button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] md:text-[8px] uppercase text-zinc-400 font-bold tracking-widest flex items-center gap-1">
                                            <span>Children</span>
                                            <span className="font-light opacity-60">(Max {room.maxChildren})</span>
                                        </label>
                                        <div className="flex items-center border border-zinc-200 :border-zinc-800 rounded-full bg-zinc-50 :bg-zinc-950/50">
                                            <button onClick={() => setRoomChildren(Math.max(0, roomChildren - 1))} className="px-3 py-1 md:px-2 md:py-0.5 hover:text-brand-red transition-colors text-zinc-400 font-bold text-base md:text-sm disabled:opacity-20" disabled={roomChildren <= 0}>-</button>
                                            <span className={`w-8 md:w-5 text-center text-sm md:text-xs font-bold ${roomChildren >= room.maxChildren ? 'text-brand-red' : 'text-brand-charcoal :text-brand-cream'}`}>{roomChildren}</span>
                                            <button onClick={() => {
                                                const newCount = Math.min(room.maxChildren, roomChildren + 1);
                                                setRoomChildren(newCount);
                                                if (newCount > roomChildAges.length) setRoomChildAges([...roomChildAges, 5]);
                                            }} className="px-3 py-1 md:px-2 md:py-0.5 hover:text-brand-red transition-colors text-zinc-400 font-bold text-base md:text-sm disabled:opacity-20" disabled={roomChildren >= room.maxChildren}>+</button>
                                        </div>
                                    </div>
                                </div>

                                {roomChildren > 0 && (
                                    <div className="w-full flex flex-wrap gap-3 mt-2 p-3 bg-zinc-50 :bg-zinc-950/30 rounded-xl border border-zinc-100 :border-zinc-800">
                                        {roomChildAges.slice(0, roomChildren).map((age, idx) => (
                                            <div key={idx} className="flex flex-col gap-1">
                                                <span className="text-[9px] md:text-[7px] text-zinc-400 uppercase font-bold">Child {idx + 1}</span>
                                                <select
                                                    value={age}
                                                    onChange={(e) => {
                                                        const newAges = [...roomChildAges];
                                                        newAges[idx] = Number(e.target.value);
                                                        setRoomChildAges(newAges);
                                                    }}
                                                    className="bg-white :bg-zinc-900 border border-zinc-200 :border-zinc-800 rounded px-2 py-1 text-xs md:text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                                                >
                                                    {[...Array(12)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>{i + 1}y</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => onAdd(room, roomAdults, roomChildren, roomChildAges.slice(0, roomChildren), roomCount)}
                                        disabled={isSoldOutInSelection || effectiveRemainingInventory < roomCount || !isMinStayMet || displayPrice === null}
                                        className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 md:px-4 md:py-1.5 font-bold uppercase tracking-widest rounded-full text-xs md:text-[10px] transition-all shadow-sm relative z-10 ${isSoldOutInSelection || effectiveRemainingInventory < roomCount || !isMinStayMet || displayPrice === null
                                            ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
                                            : 'text-white hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                        style={!(isSoldOutInSelection || effectiveRemainingInventory < roomCount || !isMinStayMet || displayPrice === null) ? { backgroundColor: property?.ibeHeaderColour || '#B18B8B' } : {}}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {isSoldOutInSelection ? 'Date Sold Out' :
                                            (!isMinStayMet ? 'Stay Too Short' :
                                                (displayPrice === null ? 'Rate Not Available' :
                                                    (effectiveRemainingInventory < roomCount ? (effectiveRemainingInventory <= 0 ? 'No Rooms Left' : `Only ${effectiveRemainingInventory} Left`) : 'add Rooms')))}
                                    </button>
                                    {effectiveRemainingInventory > 0 && !isSoldOutInSelection && (
                                        <div className={`text-xs md:text-[10px] font-bold uppercase tracking-widest text-right pr-2 ${effectiveRemainingInventory <= 2 ? 'text-brand-red animate-pulse' : 'text-brand-charcoal :text-brand-cream/80'}`}>
                                            {effectiveRemainingInventory} {effectiveRemainingInventory === 1 ? 'room' : 'rooms'} Left
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white :bg-zinc-950 border border-brand-red/20 rounded-xl p-4 animate-in fade-in duration-500 shadow-sm relative z-20">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-brand-red">
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <h4 className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Selected dates are unavailable</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {soldOutDatesInSelection.map(d => (
                                        <span key={d.toString()} className="text-[10px] font-bold text-zinc-600 :text-zinc-400 bg-zinc-50 :bg-zinc-900 border border-brand-red/20 px-2 py-0.5 rounded-md shadow-sm">
                                            Sold out: {format(d, 'MMM dd')}
                                        </span>
                                    ))}
                                </div>
                                <div className="h-px bg-brand-red/10 w-full mb-3"></div>
                                <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Suggested Available Stays</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {(() => {
                                        const stayLength = checkIn && checkOut ? differenceInDays(parseISO(checkOut), parseISO(checkIn)) : 1;
                                        const validLength = Math.max(1, stayLength);
                                        const suggestions: { start: string, end: string }[] = [];
                                        let currentSearchDt = checkIn ? parseISO(checkIn) : new Date();
                                        let found = 0;
                                        for (let i = 0; i < 60 && found < 4; i++) {
                                            let isRangeValid = true;
                                            for (let j = 0; j < validLength; j++) {
                                                const testDate = addDays(currentSearchDt, j);
                                                const testDateStr = format(testDate, 'yyyy-MM-dd');
                                                if (propertySoldOutDates.includes(testDateStr) || (property?.unavailableDates && property.unavailableDates.includes(testDateStr))) {
                                                    isRangeValid = false;
                                                    break;
                                                }
                                            }
                                            if (isRangeValid) {
                                                suggestions.push({ start: format(currentSearchDt, 'yyyy-MM-dd'), end: format(addDays(currentSearchDt, validLength), 'yyyy-MM-dd') });
                                                found++;
                                                currentSearchDt = addDays(currentSearchDt, validLength);
                                            } else {
                                                currentSearchDt = addDays(currentSearchDt, 1);
                                            }
                                        }
                                        return suggestions.map((range, i) => (
                                            <button key={i} onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(setDates({ checkIn: range.start, checkOut: range.end }));
                                            }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-gold/5 :bg-brand-gold/10 border border-brand-gold/30 hover:bg-brand-gold/20 hover:border-brand-gold transition-all group/btn shadow-sm">
                                                <span className="text-[11px] font-bold text-brand-charcoal :text-brand-cream">{format(parseISO(range.start), 'MMM dd')} - {format(parseISO(range.end), 'MMM dd')}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-brand-gold opacity-0 group-hover/btn:opacity-100 transition-opacity -ml-0.5 group-hover/btn:ml-0">
                                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
};

const RoomTypeGroup = ({
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
}: {
    roomType: any,
    ratePlans: any[],
    index: number,
    id: number | undefined,
    allRoomFeatures: any,
    getMappedRoom: (plan: any) => any,
    handleAddRoom: (room: any, adults: number, children: number, childAges: number[], roomCount: number) => void,
    guests: any,
    roomTypeAvailability: any,
    checkIn: string | null,
    checkOut: string | null,
    reservation: any,
    propertySoldOutDates: string[],
    property: any,
    allMinStay: any[]
}) => {
    const [expanded, setExpanded] = useState(true);
    const firstMappedRoom = getMappedRoom(ratePlans[0]);
    const image = firstMappedRoom.image;

    return (
        <ScrollReveal stagger={index * 0.1}>
            <div className="bg-white :bg-zinc-900 rounded-3xl overflow-hidden shadow-sm transition-all duration-500 border border-brand-gold/5 mb-8">
                <div className="flex flex-col md:flex-row cursor-pointer hover:bg-zinc-50 :hover:bg-zinc-800/50 transition-colors group" onClick={() => setExpanded(!expanded)}>
                    <div className="md:w-1/3 h-64 overflow-hidden bg-zinc-100 :bg-zinc-800">
                        {(() => {
                            if (!id) return null;
                            const allImages = (allRoomFeatures[id] || [])
                                .filter((f: any) => f.hotelRoomTypeID === roomType.hotelRoomTypeID && f.hotelRoomTypeImage)
                                .flatMap((f: any) => f.hotelRoomTypeImage.map((img: any) => img.imageURL));
                            const uniqueImages = Array.from(new Set(allImages.length > 0 ? allImages : [image])) as string[];
                            return <ImageSlider images={uniqueImages} alt={roomType.roomType} />;
                        })()}
                    </div>
                    <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-start">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase">{roomType.roomType}</h2>
                                <p className="text-sm text-zinc-500 mt-2">Max {roomType.adultSpace} Adults, {roomType.childSpace} Children</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {id && (allRoomFeatures[id] || [])
                                        .filter((f: any) => f.hotelRoomTypeID === roomType.hotelRoomTypeID && f.isTrue)
                                        .slice(0, 6)
                                        .map((f: any) => (
                                            <span key={f.hotelRoomFeatureID} className="text-[9px] font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/5 px-2.5 py-1 rounded border border-brand-gold/10">
                                                {f.roomFeature.featureName}
                                            </span>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="p-2 rounded-full border border-brand-gold/20 text-brand-gold flex-shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
                {expanded && (
                    <div className="border-t border-zinc-100 :border-zinc-800 p-4 md:p-6 space-y-2 bg-zinc-50 :bg-zinc-950/20">
                        {ratePlans.map((plan, planIdx) => {
                            const mappedRoom = getMappedRoom(plan);
                            return <RoomCard key={plan.hotelRatePlanID} room={mappedRoom} index={planIdx} onAdd={handleAddRoom} guests={guests} id={id} roomTypeAvailability={roomTypeAvailability} checkIn={checkIn} checkOut={checkOut} reservation={reservation} propertySoldOutDates={propertySoldOutDates} property={property} allMinStay={allMinStay} />;
                        })}
                    </div>
                )}
            </div>
        </ScrollReveal>
    );
};

// --- Main Page Component ---

const RoomSearchResultsPage = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const dispatch = useAppDispatch();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const isHeadless = searchParams?.get('headless') === 'true';

    const { properties, propertyRooms, roomsLoading, fullHouseAvailability } = useAppSelector((state) => state.property);
    const { ratePlans, loading: ratePlansLoading } = useAppSelector((state) => state.ratePlan);
    const { availability: roomTypeAvailability, loading: availabilityLoading } = useAppSelector((state) => state.availability);
    const { features: allRoomFeatures, loading: featuresLoading } = useAppSelector((state) => state.roomFeature);
    const { guests, checkIn, checkOut, mealPlan, residency } = useAppSelector((state) => state.booking);
    const reservation = useAppSelector((state) => state.reservation);
    const allMinStaysState = useAppSelector((state) => state.minStay.minStay);

    const property = useMemo(() => properties.find(p => p.slug === slug || p.id === Number(slug)), [properties, slug]);
    const id = property?.id;
    const rooms = useMemo(() => id ? (propertyRooms[id] || []) : [], [id, propertyRooms]);
    const propertyRatePlans = useMemo(() => id ? (ratePlans[id] || []) : [], [id, ratePlans]);
    const propertySoldOutDates = useMemo(() => id ? (fullHouseAvailability[id] || []) : [], [id, fullHouseAvailability]);
    const allMinStay = useMemo(() => id ? (allMinStaysState[id] || []) : [], [id, allMinStaysState]);

    const totalGuests = guests.adults + guests.children;

    // Diagnostics
    useEffect(() => {
        if (id) {
            console.log('RoomSearchResultsPage Diagnostics:', {
                hotelId: id,
                slug,
                propertyFound: !!property,
                propertyRatePlansCount: propertyRatePlans.length,
                totalGuests,
                mealPlan,
                residency,
                checkIn,
                checkOut
            });
        }
    }, [id, slug, property, propertyRatePlans, totalGuests, mealPlan, residency, checkIn, checkOut]);

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

    useEffect(() => {
        dispatch(clearReservation());
    }, [checkIn, checkOut, dispatch]);

    const ibeRatePlans = useMemo(() => {
        return propertyRatePlans.filter(plan => {
            if (plan.rateCodeID !== 2) return false;
            const capacity = (plan.hotelRoomType?.adultSpace || 0) + (plan.hotelRoomType?.childSpace || 0);
            const matchesCapacity = capacity >= totalGuests;
            const mealPlanName = plan.mealPlanMaster?.mealPlan || 'Standard';
            const isAllMealPlans = mealPlan === 'All Meal Plans';
            const matchesMealPlan = isAllMealPlans || mealPlanName.toLowerCase().includes(mealPlan.toLowerCase());

            let matchesResidency = true;
            const planCurrency = (plan.currencyCode || 'USD').toUpperCase();
            const propertyCurrency = (property?.currencyCode || 'USD').toUpperCase();
            if (residency === 'resident') matchesResidency = planCurrency === propertyCurrency;
            else if (residency === 'non-resident') matchesResidency = planCurrency !== propertyCurrency;

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
            features: [mealPlanName].filter(Boolean),
            description: `${mealPlanName} package for ${roomType?.roomType}.`,
            availableCount: propertyRoom?.availableCount ?? 5,
            dailyAvailability: propertyRoom?.dailyAvailability ?? {},
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
        let remainingAdults = adults, remainingChildren = children, remainingAges = [...childAges], addedCount = 0;
        for (let i = 0; i < roomCount; i++) {
            const adultsForThisRoom = Math.ceil(remainingAdults / (roomCount - i));
            const childrenForThisRoom = Math.ceil(remainingChildren / (roomCount - i));
            const agesForThisRoom = remainingAges.splice(0, childrenForThisRoom);
            remainingAdults -= adultsForThisRoom;
            remainingChildren -= childrenForThisRoom;
            const effectiveAdults = adultsForThisRoom + agesForThisRoom.filter(age => room.childAgeMax != null && age > room.childAgeMax).length;
            const chargeableChildren = agesForThisRoom.filter(age => room.childAgeMin != null && room.childAgeMax != null && age >= room.childAgeMin && age <= room.childAgeMax).length;
            const ci = checkIn || new Date().toISOString();
            const co = checkOut || new Date(Date.now() + 86400000).toISOString();
            const stayDates = eachDayOfInterval({ start: parseISO(ci), end: addDays(parseISO(co), -1) });
            let totalStayPrice = 0;
            stayDates.forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dailyPaxRates = room.rawRates?.[dateStr];
                const baseRate = (dailyPaxRates && dailyPaxRates[effectiveAdults]) ? dailyPaxRates[effectiveAdults] : (room.paxRates && room.paxRates[effectiveAdults] ? room.paxRates[effectiveAdults] : room.price);
                totalStayPrice += baseRate + (chargeableChildren * room.childRate);
            });
            dispatch(addRoom({ id: `${room.id}-${Date.now()}-${i}`, hotelId: id!, name: room.name, price: totalStayPrice, mealPlan: room.type, adults: adultsForThisRoom, children: childrenForThisRoom, childAges: agesForThisRoom, checkIn: ci, checkOut: co, roomTypeId: room.roomTypeId, hotelRatePlanID: room.hotelRatePlanID }));
            addedCount++;
        }
        if (addedCount > 0) setToast({ message: addedCount === 1 ? `${room.name} added` : `${addedCount} x ${room.name} added`, type: 'success' });
    };

    if (!property && !roomsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream :bg-brand-charcoal">
                <div className="text-center">
                    <h1 className="text-4xl font-serif mb-4 text-brand-charcoal :text-brand-cream">Property Not Found</h1>
                    <Link href="/" className="text-brand-red hover:underline font-medium">Return to Home</Link>
                </div>
            </div>
        );
    }

    const isLoading = roomsLoading || ratePlansLoading || availabilityLoading || !property;

    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white pb-12">
            <Header />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <main className="container mx-auto px-6 pt-20 pb-12">
                <ScrollReveal className="mb-10 relative z-[45]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-brand-gold/10 pb-4">
                        <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                            <h1 className="text-2xl md:text-3xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase tracking-tight">Available Rooms</h1>
                            <Link
                                href={`/hotels/${property?.slug || slug}/rooms-compact`}
                                className="text-[10px] font-bold uppercase tracking-widest text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full hover:bg-brand-gold/5 transition-all"
                            >
                                Switch to Compact View
                            </Link>
                        </div>
                        <p className="text-lg text-zinc-500 font-light mt-2 italic">At {property?.name || '...'}, {property?.location || '...'}</p>
                        <Link href={`/hotels/${property?.slug || slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-white :bg-zinc-900 rounded-full text-brand-charcoal :text-brand-cream text-xs font-bold uppercase tracking-widest hover:border-brand-gold transition-all border border-zinc-200 :border-zinc-800 shadow-sm">View Property details</Link>
                    </div>
                    <div className="max-w-7xl mx-auto">{id && <SearchBar hotelId={id} unavailableDates={property?.unavailableDates || []} />}</div>
                </ScrollReveal>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-0">
                    <div className="lg:col-span-8 space-y-8">
                        {isLoading ? (
                            <div className="space-y-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white :bg-zinc-900 rounded-3xl overflow-hidden shadow-sm animate-pulse h-64 md:flex">
                                        <div className="md:w-1/3 bg-zinc-200 :bg-zinc-800 h-full"></div>
                                        <div className="md:w-2/3 p-8 space-y-4">
                                            <div className="h-8 bg-zinc-200 :bg-zinc-800 rounded w-1/2"></div>
                                            <div className="h-4 bg-zinc-100 :bg-zinc-800 rounded w-full"></div>
                                            <div className="h-4 bg-zinc-100 :bg-zinc-800 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : groupedRoomsArray.length > 0 ? (
                            <div className="space-y-8">
                                {groupedRoomsArray.map((group, index) => (
                                    <RoomTypeGroup key={group.roomType.hotelRoomTypeID} roomType={group.roomType} ratePlans={group.ratePlans} index={index} id={id} allRoomFeatures={allRoomFeatures} getMappedRoom={getMappedRoom} handleAddRoom={handleAddRoom} guests={guests} roomTypeAvailability={roomTypeAvailability} checkIn={checkIn} checkOut={checkOut} reservation={reservation} propertySoldOutDates={propertySoldOutDates} property={property} allMinStay={allMinStay} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white :bg-zinc-900 rounded-3xl border border-brand-gold/10 shadow-sm">
                                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <h3 className="text-xl font-serif font-bold text-zinc-800 :text-zinc-200 mb-2 uppercase">No matching rooms</h3>
                                <p className="text-zinc-500 font-light italic">Refine your dates or preferences to find your perfect stay.</p>
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                        <div className="bg-white :bg-zinc-900 rounded-3xl p-8 border border-brand-gold/20 shadow-2xl space-y-8 animate-fade-up">
                            <div>
                                <h2 className="text-2xl font-bold font-serif text-brand-charcoal :text-brand-cream uppercase tracking-tight mb-2">Reservation Summary</h2>
                                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: property?.ibeHeaderColour || '#CC2229' }}></div>
                            </div>
                            {reservation.items.length > 0 ? (
                                <>
                                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-gold/20">
                                        {reservation.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start gap-4 animate-in slide-in-from-right-2">
                                                <div className="space-y-1 flex-1">
                                                    <div className="font-bold text-xs text-zinc-900 :text-zinc-100 uppercase tracking-wide leading-tight">{item.name} - {item.mealPlan.toUpperCase().includes('BASIS') ? item.mealPlan : `${item.mealPlan} BASIS`}</div>
                                                    <div className="text-[10px] font-bold text-brand-gold uppercase tracking-widest italic">${item.price} total</div>
                                                </div>
                                                <button onClick={() => { dispatch(removeRoom(item.id)); setToast({ message: `${item.name} removed`, type: 'info' }); }} className="p-1.5 text-zinc-300 hover:text-brand-red transition-colors rounded-full hover:bg-zinc-50 :hover:bg-zinc-800"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-8 border-t border-brand-gold/10 space-y-4">
                                        <div className="flex justify-between text-zinc-500 uppercase text-[10px] font-bold tracking-widest"><span>Subtotal</span><span className="text-zinc-900 :text-zinc-100">${reservation.totalAmount}</span></div>
                                        <div className="flex justify-between items-end pt-2">
                                            <span className="text-brand-charcoal :text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Total Investment</span>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold font-serif leading-none block" style={{ color: property?.ibeHeaderColour || '#CC2229' }}>${reservation.totalAmount}</span>
                                                {/* <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Including taxes</span> */}
                                            </div>
                                        </div>
                                        <Link href={`/checkout${isHeadless ? '?headless=true' : ''}`} className="w-full py-4 text-white text-center rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-xl block mt-4" style={{ backgroundColor: property?.ibeHeaderColour || '#CC2229' }}>Begin Your Journey</Link>
                                        <button onClick={() => { dispatch(clearReservation()); setToast({ message: 'All rooms cleared', type: 'info' }); }} className="w-full text-zinc-400 hover:text-zinc-600 :hover:text-zinc-200 text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 transition-colors pt-2">Clear All Selections</button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-12 h-12 bg-zinc-50 :bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto text-zinc-300"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H5L5.4 5M5.4 5H21L17 13H7M5.4 5L7 13M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="21" r="1" fill="currentColor" /><circle cx="20" cy="21" r="1" fill="currentColor" /></svg></div>
                                    <p className="text-zinc-400 text-sm italic font-light">Your booking awaits.<br />Select a room to begin.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RoomSearchResultsPage;