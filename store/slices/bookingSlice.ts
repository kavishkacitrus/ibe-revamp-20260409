import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
    destination: string;
    checkIn: string | null;
    checkOut: string | null;
    guests: {
        adults: number;
        children: number;
        childAges: number[];
        rooms: number;
    };
    mealPlan: string;
    residency: 'resident' | 'non-resident';
}

// Rehydrate dates from localStorage if available (persisted on "Explore" click).
// Discard if checkIn is in the past — stale dates should not be pre-filled.
const getSavedDates = (): { checkIn: string | null; checkOut: string | null } => {
    if (typeof window === 'undefined') return { checkIn: null, checkOut: null };
    try {
        const checkIn = localStorage.getItem('hotelmate_checkIn') || null;
        const checkOut = localStorage.getItem('hotelmate_checkOut') || null;

        if (checkIn) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // compare date only, ignore time
            const checkInDate = new Date(checkIn);
            checkInDate.setHours(0, 0, 0, 0);

            if (checkInDate < today) {
                // Past date — clear from storage and return null
                localStorage.removeItem('hotelmate_checkIn');
                localStorage.removeItem('hotelmate_checkOut');
                return { checkIn: null, checkOut: null };
            }
        }

        return { checkIn, checkOut };
    } catch {
        return { checkIn: null, checkOut: null };
    }
};

const savedDates = getSavedDates();

const initialState: BookingState = {
    destination: '',
    checkIn: savedDates.checkIn,
    checkOut: savedDates.checkOut,
    guests: {
        adults: 2,
        children: 0,
        childAges: [],
        rooms: 1,
    },
    mealPlan: 'All Meal Plans',
    residency: 'non-resident',
};

export const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setDestination: (state, action: PayloadAction<string>) => {
            state.destination = action.payload;
        },
        setDates: (state, action: PayloadAction<{ checkIn: string | null; checkOut: string | null }>) => {
            state.checkIn = action.payload.checkIn;
            state.checkOut = action.payload.checkOut;
        },
        updateGuests: (state, action: PayloadAction<Partial<BookingState['guests']>>) => {
            const newGuests = { ...state.guests, ...action.payload };

            // Sync childAges array size with children count
            if (action.payload.children !== undefined) {
                const currentAges = [...(action.payload.childAges || state.guests.childAges)];
                if (newGuests.children > currentAges.length) {
                    // Add default age (5) for new children
                    const diff = newGuests.children - currentAges.length;
                    for (let i = 0; i < diff; i++) {
                        currentAges.push(5);
                    }
                } else if (newGuests.children < currentAges.length) {
                    // Remove ages for removed children
                    currentAges.splice(newGuests.children);
                }
                newGuests.childAges = currentAges;
            }

            state.guests = newGuests;
        },
        setMealPlan: (state, action: PayloadAction<string>) => {
            state.mealPlan = action.payload;
        },
        setResidency: (state, action: PayloadAction<BookingState['residency']>) => {
            state.residency = action.payload;
        },
        resetBooking: () => initialState,
    },
});

export const { setDestination, setDates, updateGuests, setMealPlan, setResidency, resetBooking } = bookingSlice.actions;

export default bookingSlice.reducer;
