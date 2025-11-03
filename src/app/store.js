import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import tutorReducer from "../features/tutors/tutorSlice";
import bookingReducer from "../features/bookings/bookingSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    tutors: tutorReducer,
    bookings: bookingReducer,
  },
});
export default store;