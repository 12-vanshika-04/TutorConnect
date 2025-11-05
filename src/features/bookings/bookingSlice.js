import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { databases, ID } from "../../utils/appwrite";
import { Query } from "appwrite";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const BOOKINGS_TABLE = import.meta.env.VITE_APPWRITE_BOOKINGS_TABLE_ID;

/* ---------------------- CREATE BOOKING ---------------------- */
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await databases.createDocument(DB, BOOKINGS_TABLE, ID.unique(), payload);
      console.log("✅ Booking created:", res);
      return res;
    } catch (err) {
      console.error("❌ Create Booking Error:", err);
      return rejectWithValue(err.message || "Failed to create booking");
    }
  }
);

/* ---------------------- FETCH BOOKINGS ---------------------- */
export const fetchBookingsByUser = createAsyncThunk(
  "bookings/fetchBookingsByUser",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const queryField = role === "tutor" ? "tutorId" : "studentId";
      const res = await databases.listDocuments(DB, BOOKINGS_TABLE, [
        Query.equal(queryField, userId),
      ]);
      console.log(`🎯 Fetched ${role} bookings:`, res.documents);
      return res.documents;
    } catch (err) {
      console.error("❌ Fetch Bookings Error:", err);
      return rejectWithValue(err.message || "Failed to fetch bookings");
    }
  }
);

/* ---------------------- UPDATE BOOKING STATUS ---------------------- */
export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ bookingId, ...data }, { rejectWithValue }) => {
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
      );
      const res = await databases.updateDocument(DB, BOOKINGS_TABLE, bookingId, cleanedData);
      console.log("✅ Booking updated:", res);
      return res;
    } catch (err) {
      console.error("❌ Update Booking Error:", err);
      return rejectWithValue(err.message || "Failed to update booking");
    }
  }
);

/* ---------------------- SLICE ---------------------- */
const bookingSlice = createSlice({
  name: "bookings",
  initialState: { list: [], loading: false, error: null },
  reducers: {
    clearBookings: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- CREATE BOOKING ---------- */
      .addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH BOOKINGS ---------- */
      .addCase(fetchBookingsByUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookingsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBookingsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- UPDATE BOOKING STATUS ---------- */
      .addCase(updateBookingStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((b) =>
          b.$id === action.payload.$id ? action.payload : b
        );
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
