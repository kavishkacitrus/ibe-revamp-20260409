import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface PaypalOrderRequest {
    intent: string;
    purchase_units: {
        payee: {
            merchant_id: string;
        };
        amount: {
            currency_code: string;
            value: string;
        };
    }[];
    payment_source: {
        paypal: {
            experience_context: {
                payment_method_preference: string;
                landing_page: string;
                shipping_preference: string;
                user_action: string;
                return_url: string;
                cancel_url: string;
            };
        };
    };
}

export interface PaypalOrderResponse {
    id: string;
    intent: string;
    status: string;
    payment_source: {
        paypal: Record<string, any>;
    };
    purchase_units: {
        reference_id: string;
        amount: {
            currency_code: string;
            value: string;
        };
        payee: {
            merchant_id: string;
        };
        soft_descriptor: string;
    }[];
    links: {
        href: string;
        rel: string;
        method: string;
    }[];
}

interface PaypalState {
    order: PaypalOrderResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: PaypalState = {
    order: null,
    loading: false,
    error: null,
};

export const createPaypalOrder = createAsyncThunk(
    'paypal/createPaypalOrder',
    async (payload: PaypalOrderRequest, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/paypal/create-paypal-order`, {
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
                throw new Error(errorData.message || 'Failed to create PayPal order');
            }

            const data = await response.json();
            return data as PaypalOrderResponse;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const paypalSlice = createSlice({
    name: 'paypal',
    initialState,
    reducers: {
        clearOrder: (state) => {
            state.order = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPaypalOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaypalOrder.fulfilled, (state, action: PayloadAction<PaypalOrderResponse>) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(createPaypalOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearOrder } = paypalSlice.actions;
export default paypalSlice.reducer;
