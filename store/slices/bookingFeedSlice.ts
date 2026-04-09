import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BookingFeedRequest {
    data: {
        attributes: {
            id: string;
            meta: {
                ruid: string;
                is_genius: boolean;
            };
            status: string;
            services: string[];
            currency: string;
            amount: string;
            rate_code_id: number;
            created_by: string;
            remarks_internal: string;
            remarks_guest: string;
            guest_profile_id: number;
            agent: string;
            inserted_at: string;
            channel_id: string;
            property_id: string;
            hotel_id: number;
            unique_id: string;
            system_id: string;
            ota_name: string;
            booking_id: string;
            notes: string;
            arrival_date: string;
            arrival_hour: string;
            customer: {
                meta: {
                    ruid: string;
                    is_genius: boolean;
                };
                name: string;
                zip: string;
                address: string;
                country: string;
                city: string;
                language: string;
                mail: string;
                phone: string;
                surname: string;
                company: string;
            };
            departure_date: string;
            deposits: string[];
            ota_commission: string;
            ota_reservation_code: string;
            payment_collect: string;
            payment_type: string;
            rooms: {
                is_foc: boolean;
                reservation_status_id: number;
                meta: {
                    mapping_id: string;
                    parent_rate_plan_id: string;
                    meal_plan: string;
                    policies: string;
                    promotion: {
                        fromCode: string;
                        fromName: string;
                        promotionId: string;
                        toCode: string;
                    }[];
                    room_remarks: string[];
                };
                taxes: {
                    isInclusive: boolean;
                    name: string;
                    nights: number;
                    persons: number;
                    priceMode: string;
                    price_per_unit: string;
                    total_price: string;
                    type: string;
                    version: string;
                }[];
                services: string[];
                amount: string;
                days: Record<string, string>;
                guest_profile_id: number;
                ota_commission: string;
                guests: {
                    name: string;
                    surname: string;
                }[];
                occupancy: {
                    children: number;
                    adults: number;
                    ages: number[];
                    infants: number;
                };
                rate_plan_id: string;
                room_type_id: string;
                hotel_room_type_id: number;
                booking_room_id: string;
                checkin_date: string;
                checkout_date: string;
                is_cancelled: boolean;
                ota_unique_id: string;
                disc_percen: number;
                discount: number;
                child_rate: number;
                suppliment: number;
                net_rate: number;
                is_day_room: boolean;
                bed_type: string;
                res_occupancy: string;
            }[];
            occupancy: {
                children: number;
                adults: number;
                ages: number[];
                infants: number;
            };
            guarantee: {
                token: string;
                cardNumber: string;
                cardType: string;
                cardholderName: string;
                cvv: string;
                expirationDate: string;
                isVirtual: boolean;
            };
            secondary_ota: string;
            acknowledge_status: string;
            raw_message: string;
            is_crs_revision: boolean;
            is_day_room: boolean;
            release_date: string;
            ref_no: string;
            group_name: string;
            tour_no: string;
        };
        id: string;
        type: string;
        relationships: {
            data: {
                property: {
                    id: string;
                    type: string;
                };
                booking: {
                    id: string;
                    type: string;
                };
            };
        };
    }[];
    meta: {
        total: number;
        limit: number;
        order_by: string;
        page: number;
        order_direction: string;
    };
    dateTime: string;
}



export interface BookingFeedResponse {
    success: boolean;
    message: string;
    reservationNo: string;
    reservationID: number;
    invoiceNo: string;
    reservation: any; // Using any for brevity as the schema is highly nested
    reservationDetails: any[];
}

interface BookingFeedState {
    lastResponse: BookingFeedResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: BookingFeedState = {
    lastResponse: null,
    loading: false,
    error: null,
};

export const processBookingFeed = createAsyncThunk(
    'bookingFeed/processBookingFeed',
    async ({ payload, isDebug = false }: { payload: BookingFeedRequest; isDebug?: boolean }, { rejectWithValue }) => {
        try {
            const queryParams = isDebug ? '?isDebug=true' : '';
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/reservation/booking-feed${queryParams}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to process booking feed');
            }

            const data = await response.json();
            return data as BookingFeedResponse;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const bookingFeedSlice = createSlice({
    name: 'bookingFeed',
    initialState,
    reducers: {
        resetBookingFeed: (state) => {
            state.lastResponse = null;
            state.error = null;
            state.loading = false;
        },
        clearBookingFeedResponse: (state) => {
            state.lastResponse = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(processBookingFeed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(processBookingFeed.fulfilled, (state, action: PayloadAction<BookingFeedResponse>) => {
                state.loading = false;
                state.lastResponse = action.payload;
            })
            .addCase(processBookingFeed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetBookingFeed, clearBookingFeedResponse } = bookingFeedSlice.actions;

// Selectors
export const selectBookingFeedResponse = (state: { bookingFeed: BookingFeedState }) => state.bookingFeed.lastResponse;
export const selectBookingFeedLoading = (state: { bookingFeed: BookingFeedState }) => state.bookingFeed.loading;
export const selectBookingFeedError = (state: { bookingFeed: BookingFeedState }) => state.bookingFeed.error;

export default bookingFeedSlice.reducer;