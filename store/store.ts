import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import bookingReducer from './slices/bookingSlice';
import themeReducer from './slices/themeSlice';
import propertyReducer from './slices/propertySlice';
import reservationReducer from './slices/reservationSlice';
import ratePlanReducer from './slices/ratePlanSlice';
import availabilityReducer from './slices/availabilitySlice';
import roomFeatureReducer from './slices/roomFeatureSlice';
import minStayReducer from './slices/minStaySlice';
import paypalReducer from './slices/paypalSlice';
import bookingFeedReducer from './slices/bookingFeedSlice';
import currencyReducer from './slices/currencySlice';
import languageReducer from './slices/languageSlice';
import promoCodeReducer from './slices/promoCodeSlice';
import emailReducer from './slices/emailSlice';
import reservationApiReducer from './slices/reservationApiSlice';
import capturePaypalReducer from './slices/capturePaypalSlice';
import rateDetailsReducer from './slices/rateDetailsSlice';


export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      booking: bookingReducer,
      theme: themeReducer,
      property: propertyReducer,
      reservation: reservationReducer,
      ratePlan: ratePlanReducer,
      availability: availabilityReducer,
      roomFeature: roomFeatureReducer,
      minStay: minStayReducer,
      paypal: paypalReducer,
      bookingFeed: bookingFeedReducer,
      currency: currencyReducer,
      language: languageReducer,
      promoCode: promoCodeReducer,
      email: emailReducer,
      reservationApi: reservationApiReducer,
      capturePaypal: capturePaypalReducer,
      rateDetails: rateDetailsReducer,

    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
