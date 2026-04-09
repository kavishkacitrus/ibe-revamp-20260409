import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReservationItem {
    id: string;
    hotelId: number;
    name: string;
    price: number;
    mealPlan: string;
    adults: number;
    children: number;
    childAges?: number[];
    checkIn: string;
    checkOut: string;
    roomTypeId?: number;
    hotelRatePlanID?: number;
}


export interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests: string;
    estimatedArrivalTime: string;
}

interface ReservationState {
    items: ReservationItem[];
    totalAmount: number;
    customerInfo: CustomerInfo | null;
    currency: string;
    paymentMethod?: 'pay_at_hotel' | 'pay_later'; // Track payment method selection
}

const initialState: ReservationState = {
    items: [],
    totalAmount: 0,
    customerInfo: null,
    currency: 'USD',
};

export const reservationSlice = createSlice({
    name: 'reservation',
    initialState,
    reducers: {
        addRoom: (state, action: PayloadAction<ReservationItem>) => {
            state.items.push(action.payload);
            state.totalAmount += action.payload.price;
        },
        removeRoom: (state, action: PayloadAction<string>) => {
            const index = state.items.findIndex(item => item.id === action.payload);
            if (index !== -1) {
                state.totalAmount -= state.items[index].price;
                state.items.splice(index, 1);
            }
        },
        setCustomerInfo: (state, action: PayloadAction<CustomerInfo>) => {
            state.customerInfo = action.payload;
        },
        setCurrency: (state, action: PayloadAction<string>) => {
            state.currency = action.payload;
        },
        setPaymentMethod: (state, action: PayloadAction<'pay_at_hotel' | 'pay_later'>) => {
            state.paymentMethod = action.payload;
        },
        clearReservation: (state) => {
            state.items = [];
            state.totalAmount = 0;
            state.customerInfo = null;
            state.currency = 'USD';
            state.paymentMethod = undefined;
        },
    },
});

export const { addRoom, removeRoom, clearReservation, setCustomerInfo, setCurrency, setPaymentMethod } = reservationSlice.actions;

export default reservationSlice.reducer;
