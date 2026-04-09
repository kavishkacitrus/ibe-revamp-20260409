import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Response interface for the capture order endpoint
export interface CapturePaypalOrderResponse {
    id: string;
    intent: string;
    status: string;
    payment_source: {
        paypal: {
            email_address: string;
            account_id: string;
            account_status: string;
            name: {
                given_name: string;
                surname: string;
            };
            address: {
                country_code: string;
            };
        };
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
        shipping: {};
        payments: {
            captures: {
                id: string;
                status: string;
                amount: {
                    currency_code: string;
                    value: string;
                };
                final_capture: boolean;
                disbursement_mode: string;
                seller_protection: {
                    status: string;
                    dispute_categories: string[];
                };
                seller_receivable_breakdown: {
                    gross_amount: {
                        currency_code: string;
                        value: string;
                    };
                    paypal_fee: {
                        currency_code: string;
                        value: string;
                    };
                    net_amount: {
                        currency_code: string;
                        value: string;
                    };
                };
                links: {
                    href: string;
                    rel: string;
                    method: string;
                }[];
                create_time: string;
                update_time: string;
            }[];
        };
    }[];
    payer: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
        payer_id: string;
        address: {
            country_code: string;
        };
    };
    create_time: string;
    update_time: string;
    links: {
        href: string;
        rel: string;
        method: string;
    }[];
}

interface CapturePaypalState {
    captureResult: CapturePaypalOrderResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: CapturePaypalState = {
    captureResult: null,
    loading: false,
    error: null,
};

export const capturePaypalOrder = createAsyncThunk(
    'paypal/capturePaypalOrder',
    async ({ orderId, accessToken }: { orderId: string; accessToken: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/paypal/orders/${orderId}/capture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to capture PayPal order');
            }

            const data = await response.json();
            return data as CapturePaypalOrderResponse;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const capturePaypalSlice = createSlice({
    name: 'capturePaypal',
    initialState,
    reducers: {
        clearCaptureResult: (state) => {
            state.captureResult = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(capturePaypalOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(capturePaypalOrder.fulfilled, (state, action: PayloadAction<CapturePaypalOrderResponse>) => {
                state.loading = false;
                state.captureResult = action.payload;
            })
            .addCase(capturePaypalOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCaptureResult } = capturePaypalSlice.actions;
export default capturePaypalSlice.reducer;