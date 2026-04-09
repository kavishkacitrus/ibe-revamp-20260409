import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Response interface for the rate details endpoint
export interface RateDetail {
    recordId: number;
    hotelId: number;
    reservationId: number;
    reservationDetailId: number;
    rateDate: string;
    mealPlan: string;
    roomRate: number;
    discPercen: number;
    discount: number;
    childRate: number;
    exBedRate: number;
    suppliment: number;
    isFOC: boolean;
    netRate: number;
    currencyCode: string;
    exchangeRate: number | null;
    adult: number;
    child: number;
    isChecked: boolean;
    checkedBy: string | null;
    checkedAt: string | null;
    guestName: string | null;
    exBed: boolean;
    exBedCount: number;
    roomCount: number;
    isLocked: boolean;
    isNightAudit: boolean;
    updatedOn: string | null;
    updatedBy: string | null;
    finAct: boolean;
    hotelRoomTypeID: number | null;
    roomNo: string | null;
}

interface RateDetailsState {
    rateDetails: Record<number, RateDetail[]>; // Map reservationDetailId -> rate details
    loading: boolean;
    error: string | null;
}

const initialState: RateDetailsState = {
    rateDetails: {},
    loading: false,
    error: null,
};

export const fetchReservationRateDetails = createAsyncThunk(
    'rateDetails/fetchReservationRateDetails',
    async ({ 
        reservationDetailId, 
        rateDate, 
        reservationStatusId 
    }: { 
        reservationDetailId: number; 
        rateDate?: string; 
        reservationStatusId?: number; 
    }, { rejectWithValue }) => {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (rateDate) queryParams.append('rateDate', rateDate);
            if (reservationStatusId) queryParams.append('reservationStatusId', reservationStatusId.toString());
            
            const queryString = queryParams.toString();
            const url = `${process.env.NEXT_PUBLIC_API_URL}api/reservation/ratedetails/${reservationDetailId}${queryString ? `?${queryString}` : ''}`;
            
            console.log(`Fetching rate details for reservationDetailId: ${reservationDetailId}`, url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch reservation rate details');
            }

            const data = await response.json();
            console.log(`Raw response for ${reservationDetailId}:`, data);
            
            // Ensure we always return an array
            const rateDetailsArray = Array.isArray(data) ? data : [data];
            console.log(`Returning ${rateDetailsArray.length} rate details for reservationDetailId: ${reservationDetailId}`);
            console.log('Net rates:', rateDetailsArray.map((d: any) => d.netRate));
            
            // Return an object with the reservationDetailId and the rate details
            return { reservationDetailId, rateDetails: rateDetailsArray };
        } catch (error: any) {
            console.error(`Error fetching rate details for ${reservationDetailId}:`, error.message);
            return rejectWithValue(error.message);
        }
    }
);

const rateDetailsSlice = createSlice({
    name: 'rateDetails',
    initialState,
    reducers: {
        clearRateDetails: (state) => {
            state.rateDetails = {};
            state.error = null;
            state.loading = false;
        },
        clearRateDetailsForReservation: (state, action: PayloadAction<number>) => {
            const reservationDetailId = action.payload;
            delete state.rateDetails[reservationDetailId];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReservationRateDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReservationRateDetails.fulfilled, (state, action: PayloadAction<{ reservationDetailId: number; rateDetails: RateDetail[] }>) => {
                state.loading = false;
                const { reservationDetailId, rateDetails } = action.payload;
                state.rateDetails[reservationDetailId] = rateDetails;
                console.log(`Stored ${rateDetails.length} rate details for reservationDetailId ${reservationDetailId}`);
            })
            .addCase(fetchReservationRateDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.error('Rate details fetch rejected:', action.payload);
            });
    },
});

export const { clearRateDetails, clearRateDetailsForReservation } = rateDetailsSlice.actions;

// Selectors
export const selectRateDetails = (state: { rateDetails: RateDetailsState }) => state.rateDetails.rateDetails;
export const selectRateDetailsForReservation = (reservationDetailId: number) => (state: { rateDetails: RateDetailsState }) => 
    state.rateDetails.rateDetails[reservationDetailId] || [];
export const selectRateDetailsLoading = (state: { rateDetails: RateDetailsState }) => state.rateDetails.loading;
export const selectRateDetailsError = (state: { rateDetails: RateDetailsState }) => state.rateDetails.error;

export default rateDetailsSlice.reducer;