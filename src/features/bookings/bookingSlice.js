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



/* ---------------------- FETCH BOOKINGS (Auto Remove Expired) ---------------------- */
// export const fetchBookingsByUser = createAsyncThunk(
//   "bookings/fetchBookingsByUser",
//   async ({ userId, role }, { rejectWithValue }) => {
//     try {
//       const res = await databases.listDocuments(DB, BOOKINGS_TABLE);
//       const now = new Date();

//       // ✅ Filter: only bookings of this user + not expired
//       const docs = res.documents.filter((d) => {
//         const isUserBooking =
//           role === "tutor" ? d.tutorId === userId : d.studentId === userId;

//         // prevent invalid date errors
//         if (!d.date || !d.time) return false;

//         const bookingTime = new Date(`${d.date}T${d.time}`);
//         return isUserBooking && bookingTime > now; // keep upcoming bookings only
//       });

//       console.log(`🎯 ${role.toUpperCase()} Active Bookings:`, docs);
//       return docs;
//     } catch (err) {
//       return rejectWithValue(err.message || err);
//     }
//   }
// );

export const fetchBookingsByUser = createAsyncThunk(
  "bookings/fetchBookingsByUser",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      // role decides which field to query
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ---------- Create Booking ---------- */
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Fetch Bookings ---------- */
      .addCase(fetchBookingsByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookingsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBookingsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Update Booking ---------- */
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.list = state.list.map((b) =>
          b.$id === action.payload.$id ? action.payload : b
        );
      });
  },
});

export default bookingSlice.reducer;
