import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { account, databases, ID } from "../../utils/appwrite";
import { Query } from "appwrite";

/* ---------------------- SIGNUP ---------------------- */
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ email, password, name, role }, { rejectWithValue }) => {
    try {
      // Create user account
      const user = await account.create(ID.unique(), email, password, name);

      // Log in user immediately after signup
      await account.createEmailPasswordSession(email, password);

      // Save extra user data (like role)
      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_TABLE_ID,
        ID.unique(),
        {
          userId: user.$id,
          name,
          email,
          role,
        }
      );

      return { ...user, role };
    } catch (error) {
      console.error("Signup Error:", JSON.stringify(error, null, 2));
      return rejectWithValue(error?.message || "Signup failed");
    }
  }
);
/* ---------------------- LOGIN ---------------------- */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // ✅ Step 1: Delete existing session if present
      try {
        await account.deleteSession("current");
      } catch (e) {
        // ignore if there was no active session
      }

      // ✅ Step 2: Create login session
      await account.createEmailPasswordSession(email, password);

      // ✅ Step 3: Get logged-in user
      const user = await account.get();

      // ✅ Step 4: Fetch role from your users collection
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_TABLE_ID,
        [Query.equal("userId", user.$id)]
      );

      const role = res.documents.length > 0 ? res.documents[0].role : "student";

      return { ...user, role };
    } catch (error) {
      console.error("Login Error:", JSON.stringify(error, null, 2));
      return rejectWithValue(error?.message || "Login failed");
    }
  }
);


/* ---------------------- GET CURRENT USER ---------------------- */
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await account.get();

      // Get role from database
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_TABLE_ID,
        [Query.equal("userId", user.$id)]
      );

      const role = res.documents.length > 0 ? res.documents[0].role : "student";

      return { ...user, role };
    } catch (error) {
      console.error("Get Current User Error:", JSON.stringify(error, null, 2));
      return rejectWithValue(null);
    }
  }
);

/* ---------------------- LOGOUT ---------------------- */
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.warn("Logout Error:", error);
  }
});

/* ---------------------- SLICE ---------------------- */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ---- SIGNUP ---- */
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.role = action.payload.role;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ---- LOGIN ---- */
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.role = action.payload.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ---- CURRENT USER ---- */
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.role = action.payload.role;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.status = "failed";
        state.user = null;
        state.role = null;
      })

      /* ---- LOGOUT ---- */
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export default authSlice.reducer;
