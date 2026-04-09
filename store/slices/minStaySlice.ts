import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

export interface MinStayItem {
    id: number;
    hotelId: number;
    hotelRoomTypeId: number;
    dt: string;
    minStay: number;
}

interface MinStayState {
    minStay: Record<number, MinStayItem[]>; // Keyed by hotelId
    loading: boolean;
    error: string | null;
    lastFetched: Record<number, { fromDate: string; toDate: string; hotelRoomTypeId?: number }>; // Track last fetch params
}

const initialState: MinStayState = {
    minStay: {},
    loading: false,
    error: null,
    lastFetched: {},
};

// Helper to format dates for API
const formatDateForAPI = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'yyyy-MM-dd'); // API expects format like "2025-12-31"
};

export const fetchMinStay = createAsyncThunk(
    'minStay/fetchMinStay',
    async ({
        hotelId,
        hotelRoomTypeId,
        fromDate,
        toDate,
    }: {
        hotelId: number;
        hotelRoomTypeId?: number;
        fromDate: string;
        toDate: string;
    }, { rejectWithValue }) => {
        try {
            // Format dates for API
            const formattedFromDate = formatDateForAPI(fromDate);
            const formattedToDate = formatDateForAPI(toDate);

            // Build URL with query parameters
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/minstay`);
            url.searchParams.append('hotelId', hotelId.toString());
            if (hotelRoomTypeId) {
                url.searchParams.append('hotelRoomTypeId', hotelRoomTypeId.toString());
            }
            url.searchParams.append('fromDate', formattedFromDate);
            url.searchParams.append('toDate', formattedToDate);

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch min stay configuration: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                hotelId,
                minStay: data as MinStayItem[],
                params: { fromDate, toDate, hotelRoomTypeId }
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Helper to get min stay for a specific hotel
export const getHotelMinStay = (
    state: MinStayState,
    hotelId: number
): MinStayItem[] | undefined => {
    return state.minStay[hotelId];
};

// Helper to get min stay for a specific room type
export const getRoomTypeMinStay = (
    state: MinStayState,
    hotelId: number,
    hotelRoomTypeId: number
): MinStayItem[] | undefined => {
    const hotelMinStay = state.minStay[hotelId];
    if (!hotelMinStay) return undefined;
    return hotelMinStay.filter(item => item.hotelRoomTypeId === hotelRoomTypeId);
};

// Helper to get min stay for a specific date
export const getMinStayForDate = (
    state: MinStayState,
    hotelId: number,
    hotelRoomTypeId: number,
    date: string
): number | undefined => {
    const hotelMinStay = state.minStay[hotelId];
    if (!hotelMinStay) return undefined;

    const formattedDate = formatDateForAPI(date);
    const minStayItem = hotelMinStay.find(
        item => item.hotelRoomTypeId === hotelRoomTypeId && item.dt.startsWith(formattedDate.split('T')[0])
    );

    return minStayItem?.minStay;
};

// Helper to check if min stay data is valid for the requested range
export const isMinStayCached = (
    state: MinStayState,
    hotelId: number,
    fromDate: string,
    toDate: string,
    hotelRoomTypeId?: number
): boolean => {
    const lastFetch = state.lastFetched[hotelId];
    if (!lastFetch) return false;

    // Check if the cached data covers the requested parameters
    return lastFetch.fromDate === fromDate &&
        lastFetch.toDate === toDate &&
        lastFetch.hotelRoomTypeId === hotelRoomTypeId;
};

const minStaySlice = createSlice({
    name: 'minStay',
    initialState,
    reducers: {
        clearMinStay: (state) => {
            state.minStay = {};
            state.error = null;
            state.lastFetched = {};
        },
        clearHotelMinStay: (state, action: PayloadAction<number>) => {
            const hotelId = action.payload;
            delete state.minStay[hotelId];
            delete state.lastFetched[hotelId];
        },
        clearRoomTypeMinStay: (state, action: PayloadAction<{ hotelId: number; hotelRoomTypeId: number }>) => {
            const { hotelId, hotelRoomTypeId } = action.payload;
            const hotelMinStay = state.minStay[hotelId];
            if (hotelMinStay) {
                state.minStay[hotelId] = hotelMinStay.filter(item => item.hotelRoomTypeId !== hotelRoomTypeId);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMinStay.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMinStay.fulfilled, (
                state,
                action: PayloadAction<{
                    hotelId: number;
                    minStay: MinStayItem[];
                    params: { fromDate: string; toDate: string; hotelRoomTypeId?: number }
                }>
            ) => {
                state.loading = false;
                state.minStay[action.payload.hotelId] = action.payload.minStay;
                state.lastFetched[action.payload.hotelId] = {
                    fromDate: action.payload.params.fromDate,
                    toDate: action.payload.params.toDate,
                    hotelRoomTypeId: action.payload.params.hotelRoomTypeId
                };
            })
            .addCase(fetchMinStay.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearMinStay, clearHotelMinStay, clearRoomTypeMinStay } = minStaySlice.actions;
export default minStaySlice.reducer;