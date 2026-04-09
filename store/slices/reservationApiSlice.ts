import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchReservationRateDetails } from './rateDetailsSlice';
import { RootState } from '@/store/store';

// Types for the reservation API response
export interface ReservationRoom {
  reservationDetailID: number;
  roomID: number;
  roomNumber: string;
  roomType: string;
  checkIN: string;
  checkOUT: string;
  status: number;
  reservationStatusMaster: {
    reservationStatusID: number;
    reservationStatus: string;
    reservationStatusColour: string;
  };
  adults: number;
  child: number;
  extraBed: number;
  guest1: string;
  guest2: string | null;
  basis: string;
  foc: boolean;
  occupancy: string;
  bedType: string;
  isGroupLeader: string | null;
}

export interface Reservation {
  reservationID: number;
  reservationNo: string;
  status: string;
  type: string;
  bookerFullName: string;
  email: string;
  phone: string;
  refNo: string;
  hotelID: number;
  hotelName: string;
  rateCodeId: number;
  rateCode: string | null;
  ratePlanId: number | null;
  ratePlanCode: string | null;
  resCheckIn: string;
  resCheckOut: string;
  totalNights: number;
  totalRooms: number;
  totalAmount: number;
  currencyCode: string;
  sourceOfBooking: string;
  createdOn: string;
  createdBy: string;
  lastUpdatedOn: string | null;
  lastUpdatedBy: string | null;
  isCancelled: boolean;
  rooms: ReservationRoom[];
  guestProfileId: number;
  remarksGuest: string;
  remarksInternal: string;
  nameId: number;
  hotelCode: number;
  tourNo: string;
  groupName: string;
  bookerCountry: string;
  rateDetailsTotal?: number; // Total calculated from rate details for voucher
}

interface ReservationApiState {
  reservation: Reservation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReservationApiState = {
  reservation: null,
  loading: false,
  error: null,
};

// Async thunk to fetch reservation by ID
export const fetchReservationById = createAsyncThunk(
  'reservationApi/fetchReservationById',
  async (reservationId: number, { rejectWithValue, dispatch }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

      if (!apiUrl || !accessToken) {
        throw new Error('API URL or Access Token is not configured');
      }

      // First, fetch the reservation data
      const response = await fetch(`${apiUrl}api/reservation/${reservationId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reservation: ${response.status} ${response.statusText}`);
      }

      const reservationData: Reservation = await response.json();
      console.log('Reservation data fetched:', reservationData);

      // Fetch rate details for each reservation detail ID
      if (reservationData.rooms && reservationData.rooms.length > 0) {
        console.log(`Fetching rate details for ${reservationData.rooms.length} rooms...`);
        
        // Fetch rate details for each reservationDetailId
        const rateDetailPromises = reservationData.rooms.map(async (room) => {
          try {
            // Dispatch the rateDetails fetch for this reservationDetailId
            const result = await dispatch(fetchReservationRateDetails({ 
              reservationDetailId: room.reservationDetailID 
            })).unwrap();
            
            // result now contains { reservationDetailId, rateDetails }
            console.log(`Rate details result for room ${room.reservationDetailID}:`, result);
            return result;
          } catch (error) {
            console.error(`Failed to fetch rate details for reservation detail ${room.reservationDetailID}:`, error);
            return { 
              reservationDetailId: room.reservationDetailID, 
              rateDetails: [] 
            };
          }
        });

        const rateDetailsResults = await Promise.all(rateDetailPromises);
        console.log('All rate details results:', rateDetailsResults);

        // Calculate total from rate details (sum of all netRate values)
        let totalFromRateDetails = 0;
        
        rateDetailsResults.forEach(({ reservationDetailId, rateDetails }) => {
          if (rateDetails && Array.isArray(rateDetails) && rateDetails.length > 0) {
            rateDetails.forEach((rateDetail: any) => {
              // Sum all netRate values
              if (rateDetail.netRate && rateDetail.netRate > 0) {
                totalFromRateDetails += rateDetail.netRate;
                console.log(`Added netRate ${rateDetail.netRate} from reservationDetailId ${reservationDetailId}`);
              }
            });
          } else {
            console.warn(`No rate details found for reservation detail ${reservationDetailId}`);
          }
        });

        console.log(`Total calculated from rate details: ${totalFromRateDetails} ${reservationData.currencyCode}`);
        
        // Add the calculated total to the reservation data
        reservationData.rateDetailsTotal = totalFromRateDetails;
      } else {
        console.log('No rooms found in reservation');
        // If no rooms, use the totalAmount from the reservation
        reservationData.rateDetailsTotal = reservationData.totalAmount || 0;
      }

      console.log('Final reservation data with rateDetailsTotal:', {
        refNo: reservationData.refNo,
        rateDetailsTotal: reservationData.rateDetailsTotal,
        totalAmount: reservationData.totalAmount
      });

      return reservationData;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch reservation'
      );
    }
  }
);

const reservationApiSlice = createSlice({
  name: 'reservationApi',
  initialState,
  reducers: {
    clearReservationApi: (state) => {
      state.reservation = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.loading = false;
        state.reservation = action.payload;
        state.error = null;
        console.log('Reservation stored in state with rateDetailsTotal:', action.payload.rateDetailsTotal);
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.reservation = null;
        console.error('Failed to fetch reservation:', action.payload);
      });
  },
});

export const { clearReservationApi, clearError } = reservationApiSlice.actions;

// Selectors
export const selectReservation = (state: { reservationApi: ReservationApiState }) => state.reservationApi.reservation;
export const selectReservationLoading = (state: { reservationApi: ReservationApiState }) => state.reservationApi.loading;
export const selectReservationError = (state: { reservationApi: ReservationApiState }) => state.reservationApi.error;

export default reservationApiSlice.reducer;