import { createSlice } from "@reduxjs/toolkit";
const slice = createSlice({
  name: "user",
  initialState: { user: null, loading: false },
  reducers: {
    setUser: (s, a) => { s.user = a.payload; },
    logoutUser: s => { s.user = null; },
    setLoading: (s, a) => { s.loading = a.payload; },
  },
});
export const { setUser, logoutUser, setLoading } = slice.actions;
export default slice.reducer;
