import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ExchangeRate {
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    timestamp: number;
}

interface CurrencyState {
    exchangeRates: Record<string, ExchangeRate>;
    selectedCurrency: string;
    loading: boolean;
    error: string | null;
}

const initialState: CurrencyState = {
    exchangeRates: {},
    selectedCurrency: 'USD',
    loading: false,
    error: null,
};

// Create a unique key for exchange rate pairs
const getExchangeRateKey = (baseCurrency: string, targetCurrency: string) => 
    `${baseCurrency}_${targetCurrency}`;

export const fetchExchangeRate = createAsyncThunk(
    'currency/fetchExchangeRate',
    async ({ 
        baseCurrency, 
        targetCurrency 
    }: { 
        baseCurrency: string; 
        targetCurrency: string; 
    }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}api/currency/exchange-rate?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}`,
                {
                    headers: {
                        'accept': 'text/plain'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch exchange rate');
            }

            const rateText = await response.text();
            const rate = parseFloat(rateText);

            if (isNaN(rate)) {
                throw new Error('Invalid exchange rate response');
            }

            return {
                baseCurrency,
                targetCurrency,
                rate,
                timestamp: Date.now()
            } as ExchangeRate;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {
        setSelectedCurrency: (state, action: PayloadAction<string>) => {
            state.selectedCurrency = action.payload;
        },
        clearExchangeRates: (state) => {
            state.exchangeRates = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExchangeRate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExchangeRate.fulfilled, (state, action: PayloadAction<ExchangeRate>) => {
                state.loading = false;
                const key = getExchangeRateKey(action.payload.baseCurrency, action.payload.targetCurrency);
                state.exchangeRates[key] = action.payload;
            })
            .addCase(fetchExchangeRate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { setSelectedCurrency, clearExchangeRates } = currencySlice.actions;

// Selectors
export const selectExchangeRate = (baseCurrency: string, targetCurrency: string) => 
    (state: { currency: CurrencyState }) => {
        const key = getExchangeRateKey(baseCurrency, targetCurrency);
        return state.currency.exchangeRates[key];
    };

export const selectSelectedCurrency = (state: { currency: CurrencyState }) => 
    state.currency.selectedCurrency;

export const selectCurrencyLoading = (state: { currency: CurrencyState }) => 
    state.currency.loading;

export const selectCurrencyError = (state: { currency: CurrencyState }) => 
    state.currency.error;

export default currencySlice.reducer;
