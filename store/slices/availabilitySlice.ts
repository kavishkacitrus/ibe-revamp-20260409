import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

export interface AvailabilityItem {
    date: string;
    count: number;
}

export interface HotelRate {
    recordID: number;
    hotelRatePlanID: number;
    rateDate: string;
    defaultRate: number;
    pax1: number | null;
    pax2: number | null;
    pax3: number | null;
    pax4: number | null;
    pax5: number | null;
    pax6: number | null;
    pax7: number | null;
    pax8: number | null;
    pax9: number | null;
    pax10: number | null;
    pax11: number | null;
    pax12: number | null;
    pax13: number | null;
    pax14: number | null;
    pax15: number | null;
    pax16: number | null;
    pax17: number | null;
    pax18: number | null;
    child: number;
    dateFrom: string | null;
    dateTo: string | null;
    sellMode: string | null;
    rateMode: string | null;
    roomTypeID: number | null;
    primaryOccupancy: number | null;
    increaseBy: number | null;
    decreaseBy: number | null;
}

export interface RoomAvailability {
    roomTypeId: number;
    roomType: string;
    roomCmId: string;
    roomCount: number;
    availability: AvailabilityItem[];
    adultCount: number;
    childCount: number;
    averageRate: number;
    hotelRates: HotelRate[];
    rateCodeId: number;
    rateCode: string;
    mealPlanId: number;
    mealPlan: string;
    title: string;
    roomGuid: string;
}

interface AvailabilityState {
    availability: Record<number, RoomAvailability[]>; // Keyed by hotelId
    loading: boolean;
    error: string | null;
    lastFetched: Record<number, { startDate: string; endDate: string }>; // Track last fetch params
}

const initialState: AvailabilityState = {
    availability: {},
    loading: false,
    error: null,
    lastFetched: {},
};

// Helper to format dates for API
const formatDateForAPI = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MM-dd-yyyy');
};

export const fetchRoomAvailability = createAsyncThunk(
    'availability/fetchRoomAvailability',
    async ({
        hotelId,
        startDate,
        endDate,
        rateCodeId = 2,
        currencyCode = 'USD'
    }: {
        hotelId: number;
        startDate: string;
        endDate: string;
        rateCodeId?: number;
        currencyCode?: string;
    }, { rejectWithValue }) => {
        try {
            // Format dates for API
            const formattedStartDate = formatDateForAPI(startDate);
            const formattedEndDate = formatDateForAPI(endDate);

            // Build URL with query parameters
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/hotelrateplans/availability/${hotelId}`);
            url.searchParams.append('startDate', formattedStartDate);
            url.searchParams.append('endDate', formattedEndDate);
            url.searchParams.append('rateCodeId', rateCodeId.toString());
            if (currencyCode) {
                url.searchParams.append('currencyCode', currencyCode);
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch room availability: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                hotelId,
                availability: data as RoomAvailability[],
                params: { startDate, endDate, rateCodeId, currencyCode }
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Helper to get availability for a specific room type
export const getRoomTypeAvailability = (
    state: AvailabilityState,
    hotelId: number,
    roomTypeId: number
): RoomAvailability | undefined => {
    const hotelAvailability = state.availability[hotelId];
    if (!hotelAvailability) return undefined;
    return hotelAvailability.find(item => item.roomTypeId === roomTypeId);
};

// Helper to check if cached data is still valid for the date range
export const isAvailabilityCached = (
    state: AvailabilityState,
    hotelId: number,
    startDate: string,
    endDate: string
): boolean => {
    const lastFetch = state.lastFetched[hotelId];
    if (!lastFetch) return false;

    // Check if the cached data covers exactly the requested range
    // You might want to adjust this logic based on your needs
    return lastFetch.startDate === startDate && lastFetch.endDate === endDate;
};

const availabilitySlice = createSlice({
    name: 'availability',
    initialState,
    reducers: {
        clearAvailability: (state) => {
            state.availability = {};
            state.error = null;
            state.lastFetched = {};
        },
        clearHotelAvailability: (state, action: PayloadAction<number>) => {
            const hotelId = action.payload;
            delete state.availability[hotelId];
            delete state.lastFetched[hotelId];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomAvailability.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoomAvailability.fulfilled, (
                state,
                action: PayloadAction<{
                    hotelId: number;
                    availability: RoomAvailability[];
                    params: { startDate: string; endDate: string; rateCodeId: number; currencyCode: string }
                }>
            ) => {
                state.loading = false;
                state.availability[action.payload.hotelId] = action.payload.availability;
                state.lastFetched[action.payload.hotelId] = {
                    startDate: action.payload.params.startDate,
                    endDate: action.payload.params.endDate
                };
            })
            .addCase(fetchRoomAvailability.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearAvailability, clearHotelAvailability } = availabilitySlice.actions;
export default availabilitySlice.reducer;