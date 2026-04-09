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

export interface RoomFeature {
    roomFeatureID: number;
    featureCategory: string;
    featureName: string;
}

export interface HotelRoomTypeImage {
    imageID: number;
    hotelID: number;
    hotelRoomTypeID: number;
    imageURL: string;
    description: string;
    isMain: boolean;
    finAct: boolean;
    createdOn: string;
    createdBy: string;
    updatedOn: string | null;
    updatedBy: string | null;
    base64Image: string | null;
    imageFileName: string | null;
}

export interface HotelRoomType {
    hotelRoomTypeID: number;
    hotelID: number;
    roomType: string;
    adultSpace: number;
    childSpace: number;
    noOfRooms: number;
    cmid: string;
    createdTimeStamp: string;
    createdBy: string;
    updatedBy: string;
    glAccountId: number | null;
    finAct: boolean;
    updatedTimeStamp: string | null;
    roomDescription: string;
}

export interface HotelRoomFeature {
    hotelRoomFeatureID: number;
    hotelID: number;
    hotelMaster: HotelMaster[] | HotelMaster | null;
    roomFeatureID: number;
    roomFeature: RoomFeature;
    hotelRoomTypeID: number;
    hotelRoomType: HotelRoomType;
    isTrue: boolean;
    hotelRoomTypeImage: HotelRoomTypeImage[];
}

interface RoomFeatureState {
    features: Record<number, HotelRoomFeature[]>; // Keyed by hotelId
    loading: boolean;
    error: string | null;
}

const initialState: RoomFeatureState = {
    features: {},
    loading: false,
    error: null,
};

export const fetchRoomFeatures = createAsyncThunk(
    'roomFeature/fetchRoomFeatures',
    async (hotelId: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/hotelroomfeature/hotel-id/${hotelId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch room features: ${response.statusText}`);
            }

            const data = await response.json();
            return { hotelId, features: data as HotelRoomFeature[] };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const roomFeatureSlice = createSlice({
    name: 'roomFeature',
    initialState,
    reducers: {
        clearRoomFeatures: (state) => {
            state.features = {};
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomFeatures.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoomFeatures.fulfilled, (state, action) => {
                state.loading = false;
                state.features[action.payload.hotelId] = action.payload.features;
            })
            .addCase(fetchRoomFeatures.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearRoomFeatures } = roomFeatureSlice.actions;
export default roomFeatureSlice.reducer;
