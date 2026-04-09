import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface PromoCode {
  promoId: number;
  hotelCode: string;
  promoCode: string;
  description: string;
  isActive: boolean;
  promoType: string;
  dateFrom: string;
  dateTo: string;
  value: number;
  freeNights: number;
  ebDayCount: number;
  isShowOnIBE: boolean;
}

export interface PromoCodeState {
  promoCodes: PromoCode[];
  currentPromoCode: PromoCode | null;
  loading: boolean;
  error: string | null;
  validationError: string | null;
  isValidating: boolean;
  appliedPromoCode: string | null;
}

// Async thunk for fetching promo codes
export const fetchPromoCodes = createAsyncThunk(
  'promoCode/fetchPromoCodes',
  async (params: {
    hotelCode?: string;
    isActive?: boolean;
    isShowOnIBE?: boolean;
    fromDate?: string;
    toDate?: string;
    promoCode?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.hotelCode) queryParams.append('hotelCode', params.hotelCode);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.isShowOnIBE !== undefined) queryParams.append('isShowOnIBE', params.isShowOnIBE.toString());
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.promoCode) queryParams.append('promoCode', params.promoCode);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7188';
      const response = await fetch(`${baseUrl}/api/promocode?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data]; // Ensure we always return an array
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      throw error;
    }
  }
);

// Async thunk for validating a specific promo code
export const validatePromoCode = createAsyncThunk(
  'promoCode/validatePromoCode',
  async ({ promoCode, hotelCode }: { promoCode: string; hotelCode?: string }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const queryParams = new URLSearchParams();
      queryParams.append('promoCode', encodeURIComponent(promoCode));
      
      if (hotelCode) {
        queryParams.append('hotelCode', hotelCode);
      }

      const response = await fetch(`${baseUrl}api/promocode?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle array response - get the first promo code
      const promoCodeData = Array.isArray(data) ? data[0] : data;

      if (!promoCodeData) {
        throw new Error('Promo code not found');
      }

      // Check if the promo code is valid and active
      if (!promoCodeData.isActive || !promoCodeData.isShowOnIBE) {
        throw new Error('Promo code is not valid or active');
      }

      // Check if the promo code is within valid date range
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const fromDate = new Date(promoCodeData.dateFrom);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(promoCodeData.dateTo);
      toDate.setHours(23, 59, 59, 999);

      if (now < fromDate || now > toDate) {
        throw new Error('Promo code has expired or is not yet valid');
      }

      return promoCodeData as PromoCode;
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
  }
);

// Initial state
const initialState: PromoCodeState = {
  promoCodes: [],
  currentPromoCode: null,
  loading: false,
  error: null,
  validationError: null,
  isValidating: false,
  appliedPromoCode: null,
};

// Slice
const promoCodeSlice = createSlice({
  name: 'promoCode',
  initialState,
  reducers: {
    clearPromoCode: (state) => {
      state.currentPromoCode = null;
      state.appliedPromoCode = null;
      state.validationError = null;
    },
    clearValidationError: (state) => {
      state.validationError = null;
    },
    setAppliedPromoCode: (state, action: PayloadAction<string>) => {
      state.appliedPromoCode = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch promo codes
    builder
      .addCase(fetchPromoCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromoCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPromoCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch promo codes';
      });

    // Validate promo code
    builder
      .addCase(validatePromoCode.pending, (state) => {
        state.isValidating = true;
        state.validationError = null;
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.isValidating = false;
        state.currentPromoCode = action.payload;
        state.appliedPromoCode = action.payload.promoCode;
        state.validationError = null;
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.isValidating = false;
        state.currentPromoCode = null;
        state.validationError = action.error.message || 'Invalid promo code';
      });
  },
});

// Selectors
export const selectPromoCodes = (state: { promoCode: PromoCodeState }) => state.promoCode.promoCodes;
export const selectCurrentPromoCode = (state: { promoCode: PromoCodeState }) => state.promoCode.currentPromoCode;
export const selectPromoCodeLoading = (state: { promoCode: PromoCodeState }) => state.promoCode.loading;
export const selectPromoCodeError = (state: { promoCode: PromoCodeState }) => state.promoCode.error;
export const selectPromoCodeValidationError = (state: { promoCode: PromoCodeState }) => state.promoCode.validationError;
export const selectPromoCodeIsValidating = (state: { promoCode: PromoCodeState }) => state.promoCode.isValidating;
export const selectAppliedPromoCode = (state: { promoCode: PromoCodeState }) => state.promoCode.appliedPromoCode;

// Actions
export const { clearPromoCode, clearValidationError, setAppliedPromoCode } = promoCodeSlice.actions;

// Reducer
export default promoCodeSlice.reducer;
