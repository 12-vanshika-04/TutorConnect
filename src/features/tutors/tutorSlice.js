import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { databases } from "../../utils/appwrite";
import { Query } from "appwrite";

export const fetchTutors = createAsyncThunk(
  "tutors/fetchTutors",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queries = [];

      if (filters.subject)
        queries.push(Query.contains("subject", filters.subject));

      // ✅ Updated line — partial matching for location
      if (filters.location)
        queries.push(Query.search("location", filters.location));

      if (filters.languages)
        queries.push(Query.equal("languages", filters.languages));

      if (filters.standard)
        queries.push(Query.search("standard", filters.standard));

      if (filters.gender)
        queries.push(Query.equal("gender", filters.gender));

      if (filters.minFees && filters.maxFees)
        queries.push(Query.between("fees", filters.minFees, filters.maxFees));

      const result = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID,
        queries
      );

      return result.documents;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const tutorSlice = createSlice({
  name: "tutors",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTutors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTutors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tutorSlice.reducer;
