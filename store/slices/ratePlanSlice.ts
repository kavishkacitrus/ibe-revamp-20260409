import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface HotelMaster {
    hotelID: number;
    hotelName: string;
    childAgeMin: number;
    childAgeMax: number;
    ibE_AllowPayLater: boolean;
    ibE_PayLater_Days: number;
    [key: string]: any;
}

export interface HotelRatePlan {
    hotelID: number;
    title: string;
    rateCodeID: number;
    mealPlanID: number;
    currencyCode: string;
    childRate: number;
    defaultRate: number;
    sellMode: string;
    primaryOccupancy: number;
    hotelRates: any[];
    hotelRoomType: any;
    mealPlanMaster: any;
    rateCode: any;
    hotelMaster: HotelMaster[] | HotelMaster;
    [key: string]: any;
}

interface RatePlanState {
    ratePlans: Record<number, HotelRatePlan[]>;
    loading: boolean;
    error: string | null;
}

const initialState: RatePlanState = {
    ratePlans: {},
    loading: false,
    error: null,
};

export const fetchHotelRatePlans = createAsyncThunk(
    'ratePlan/fetchHotelRatePlans',
    async ({ hotelId, isCmActive = false }: { hotelId: number; isCmActive?: boolean }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/hotelrateplans/hotel/${hotelId}?isCmActive=${isCmActive}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch hotel rate plans');
            }

            const data = await response.json();
            return { hotelId, ratePlans: data as HotelRatePlan[] };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const ratePlanSlice = createSlice({
    name: 'ratePlan',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHotelRatePlans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHotelRatePlans.fulfilled, (state, action: PayloadAction<{ hotelId: number; ratePlans: HotelRatePlan[] }>) => {
                state.loading = false;
                state.ratePlans[action.payload.hotelId] = action.payload.ratePlans;
            })
            .addCase(fetchHotelRatePlans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default ratePlanSlice.reducer;
