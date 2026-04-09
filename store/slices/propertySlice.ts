import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Property } from '@/app/data/properties';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

interface Room {
    id: string;
    roomTypeId: number;
    name: string;
    type: string;
    price: number;
    paxRates: Record<number, number>; // Average pax rate for the period
    capacity: number;
    image: string;
    features: string[];
    description: string;
    availableCount: number;
    dailyAvailability: Record<string, number>; // Map date string -> count
    maxAdults: number;
    maxChildren: number;
}

export interface IPGConfig {
    ipgId: number;
    hotelId: number;
    isIPGActive: boolean;
    isSandBoxMode: boolean;
    bankName: string;
    country: string;
    currencyCode: string;
    location: string;
    ipgName: string;
    merchandIdUSD: string;
    profileIdUSD: string;
    accessKeyUSD: string;
    secretKey: string;
}

interface DailyRate {
    lowestRate: number;
    paxRates: Record<number, number>; // Lowest rate per occupancy across all rooms
    available: boolean;
}

interface PropertyState {
    properties: Property[];
    propertyRooms: Record<number, Room[]>;
    dailyRates: Record<number, Record<string, DailyRate>>; // Map hotelID -> date string -> rate info
    fullHouseAvailability: Record<number, string[]>; // Map hotelID -> array of sold-out date strings (yyyy-MM-dd)
    hotelIPGs: Record<number, IPGConfig[]>; // Map hotelID -> IPG configs
    loading: boolean;
    roomsLoading: boolean;
    error: string | null;
    initialized: boolean;
}

const initialState: PropertyState = {
    properties: [],
    propertyRooms: {},
    dailyRates: {},
    fullHouseAvailability: {},
    hotelIPGs: {},
    loading: false,
    roomsLoading: false,
    error: null,
    initialized: false
};

export const fetchProperties = createAsyncThunk(
    'property/fetchProperties',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/admin/all-hotels`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch hotels');
            }

            const data = await response.json();

            // Map API response to our Property interface
            return data
                .filter((hotel: any) => hotel.finAct === 0 || hotel.finAct === false)
                .map((hotel: any) => ({
                    id: hotel.hotelID,
                    slug: hotel.slug ? (hotel.slug.replace(/\/$/, '').split('/').pop() || hotel.hotelID.toString()) : hotel.hotelID.toString(),
                    name: hotel.hotelName,
                    city: hotel.city,
                    country: hotel.country,
                    currencyCode: hotel.currencyCode || 'USD',
                    location: `${hotel.city}, ${hotel.country}`,
                    price: hotel.lowestRate ? `$${hotel.lowestRate}` : 'Price on request',
                    rating: hotel.starCatgeory || 4.5,
                    image: (hotel.hotelImage?.imageFileName || hotel.logoURL || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop').split('?')[0],
                    tags: [hotel.hotelType, "Luxury"].filter(Boolean),
                    description: hotel.hotelDesc || `Discover the exceptional comfort of ${hotel.hotelName} in ${hotel.city}.`,
                    rooms: [],
                    unavailableDates: [],
                    ibE_CancellationPolicy: hotel.ibE_CancellationPolicy,
                    ibE_ChildPolicy: hotel.ibE_ChildPolicy,
                    ibE_TaxPolicy: hotel.ibE_TaxPolicy,
                    hotelPhone: hotel.hotelPhone,
                    hotelEmail: hotel.hotelEmail,
                    ibE_LogoURL: hotel.ibE_LogoURL,
                    ibE_Pay50: hotel.ibE_Pay50,
                    ibeHeaderColour: hotel.ibeHeaderColour,
                    ibeLogoWidth: hotel.ibE_Logo_Width,
                    ibeLogoHeight: hotel.ibE_Logo_Height,
                    hotelCode: hotel.hotelCode?.toString() || hotel.hotelID?.toString(),
                    ibeHomeImage: hotel.ibeHomeImage,
                    hotelAddress: hotel.hotelAddress,
                    ibE_AllowPayLater: hotel.ibE_AllowPayLater,
                    ibE_PayLater_Days: hotel.ibE_PayLater_Days
                })) as Property[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPropertyRooms = createAsyncThunk(
    'property/fetchPropertyRooms',
    async ({ hotelId, startDate, endDate }: { hotelId: number, startDate: string, endDate: string }, { rejectWithValue }) => {
        try {
            // Encode dates to ensure they are safe for the URL
            const start = startDate.split('T')[0];
            const end = endDate.split('T')[0];

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/hotelrateplans/availability/${hotelId}?startDate=${start}&endDate=${end}&rateCodeId=2`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }

            const data = await response.json();

            // Extract daily rates and identify sold-out dates for the calendar
            const dailyRates: Record<string, DailyRate> = {};
            const dateAvailabilityCounts: Record<string, { totalRooms: number, soldOutRooms: number }> = {};

            // Initialize the range with default sold-out status
            const interval = eachDayOfInterval({
                start: parseISO(start),
                end: parseISO(end)
            });

            interval.forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                dailyRates[dateStr] = {
                    lowestRate: Infinity,
                    paxRates: {},
                    available: false
                };
                dateAvailabilityCounts[dateStr] = { totalRooms: 0, soldOutRooms: 0 };
            });

            data.forEach((room: any) => {
                const roomDailyAvailability = (room.availability || []).reduce((acc: Record<string, number>, curr: any) => {
                    try {
                        const dStr = format(parseISO(curr.date), 'yyyy-MM-dd');
                        acc[dStr] = curr.count;
                    } catch (e) {
                        const dStr = curr.date.split('T')[0];
                        acc[dStr] = curr.count;
                    }
                    return acc;
                }, {});

                for (const [dateStr, count] of Object.entries(roomDailyAvailability)) {
                    const isAvailable = (count as number) > 0;

                    if (!dailyRates[dateStr]) {
                        dailyRates[dateStr] = {
                            lowestRate: Infinity, // Rates will come from hotelrateplans
                            paxRates: {},
                            available: isAvailable
                        };
                        dateAvailabilityCounts[dateStr] = { totalRooms: 0, soldOutRooms: 0 };
                    }

                    dateAvailabilityCounts[dateStr].totalRooms++;
                    if (!isAvailable) {
                        dateAvailabilityCounts[dateStr].soldOutRooms++;
                    }

                    if (isAvailable) {
                        dailyRates[dateStr].available = true; // If any room is available, day is available
                    }
                }
            });

            // A date is "full house sold out" if all rooms returned for that date have count 0
            // or if no rooms were returned for that date at all in the requested range
            const soldOutDates = Object.entries(dateAvailabilityCounts)
                .filter(([_, counts]) => counts.totalRooms === 0 || counts.totalRooms === counts.soldOutRooms)
                .map(([date, _]) => date);

            // Map API response to our Room interface
            return {
                hotelId,
                rooms: data.map((item: any) => {
                    return {
                        id: `room-${item.roomTypeId}-${item.rateCodeId}`,
                        roomTypeId: item.roomTypeId,
                        name: item.roomType,
                        type: item.mealPlan || item.rateCode || 'Standard',
                        price: item.averageRate, // This index average rate from availability API
                        paxRates: {}, // Rates will be handled by hotelRatePlans
                        capacity: (item.adultCount || 0) + (item.childCount || 0),
                        image: '', // Remove hardcoded image, will use dynamic images from room features
                        features: [
                            "Climate Control",
                            "High-speed Wi-Fi",
                            item.mealPlan,
                            `${item.availability && item.availability.length > 0 ? Math.min(...item.availability.map((a: any) => a.count)) : 0} Rooms Available`
                        ].filter(Boolean),
                        description: `${item.roomType} offering a serene escape. Rated for ${item.adultCount} adults and ${item.childCount} children. Meal plan: ${item.mealPlan || 'Not specified'}.`,
                        availableCount: item.availability && item.availability.length > 0
                            ? Math.min(...item.availability.map((a: any) => a.count))
                            : 0,
                        dailyAvailability: (item.availability || []).reduce((acc: Record<string, number>, curr: any) => {
                            acc[curr.date.split('T')[0]] = curr.count;
                            return acc;
                        }, {}),
                        maxAdults: item.adultCount || 2,
                        maxChildren: item.childCount || 2
                    };
                }) as Room[],
                dailyRates,
                soldOutDates
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchFullHouseAvailability = createAsyncThunk(
    'property/fetchFullHouseAvailability',
    async (hotelId: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/ibe/full-house-availability?hotelId=${hotelId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch availability');
            }

            const data = await response.json();

            // Filter for dates where availability is 0 or less
            const soldOutDates = data
                .filter((item: any) => item.available <= 0)
                .map((item: any) => item.dt.split('T')[0]);

            return { hotelId, soldOutDates };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchHotelIPG = createAsyncThunk(
    'property/fetchHotelIPG',
    async (hotelId: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/hotelipg?hotelId=${hotelId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch IPG configurations');
            }

            const data = await response.json();
            return { hotelId, ipgs: data as IPGConfig[] };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const generatePaymentLink = createAsyncThunk(
    'property/generatePaymentLink',
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/payplus/payment-session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'accept': 'text/plain'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate payment link');
            }

            const data = await response.json();
            return data; // This should contain { result, data: { link, token, orderId } }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const propertySlice = createSlice({
    name: 'property',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
                state.loading = false;
                state.properties = action.payload;
                state.initialized = true;
            })
            .addCase(fetchProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.initialized = true;
            })
            .addCase(fetchPropertyRooms.pending, (state) => {
                state.roomsLoading = true;
            })
            .addCase(fetchPropertyRooms.fulfilled, (state, action: PayloadAction<{ hotelId: number, rooms: Room[], dailyRates: Record<string, DailyRate>, soldOutDates: string[] }>) => {
                state.roomsLoading = false;
                state.propertyRooms[action.payload.hotelId] = action.payload.rooms;
                state.dailyRates[action.payload.hotelId] = {
                    ...(state.dailyRates[action.payload.hotelId] || {}),
                    ...action.payload.dailyRates
                };

                // Merge sold out dates from availability endpoint
                const currentSoldOut = state.fullHouseAvailability[action.payload.hotelId] || [];
                const newSoldOut = action.payload.soldOutDates;
                const mergedSoldOut = Array.from(new Set([...currentSoldOut, ...newSoldOut]));
                state.fullHouseAvailability[action.payload.hotelId] = mergedSoldOut;
            })
            .addCase(fetchPropertyRooms.rejected, (state, action) => {
                state.roomsLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchFullHouseAvailability.fulfilled, (state, action: PayloadAction<{ hotelId: number, soldOutDates: string[] }>) => {
                state.fullHouseAvailability[action.payload.hotelId] = action.payload.soldOutDates;
            })
            .addCase(fetchHotelIPG.fulfilled, (state, action: PayloadAction<{ hotelId: number, ipgs: IPGConfig[] }>) => {
                state.hotelIPGs[action.payload.hotelId] = action.payload.ipgs;
            });
    }
});

export default propertySlice.reducer;
