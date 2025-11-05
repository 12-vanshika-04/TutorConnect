// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { account, databases, ID } from "../../utils/appwrite";
import { Query } from "appwrite";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID;

/* ------------------ SIGNUP ------------------ */
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const user = await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);

      // Add to users collection
      await databases.createDocument(DB, USERS_COLLECTION, ID.unique(), {
        userId: user.$id,
        name,
        email,
        role: null,
      });

      return { ...user, role: null };
    } catch (err) {
      return rejectWithValue(err.message || "Signup failed");
    }
  }
);

/* ------------------ LOGIN ------------------ */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      try {
        await account.deleteSession("current");
      } catch (e) {}

      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      const res = await databases.listDocuments(DB, USERS_COLLECTION, [
        Query.equal("userId", user.$id),
      ]);

      const role = res.documents.length ? res.documents[0].role : null;
      return { ...user, role };
    } catch (err) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

/* ------------------ GOOGLE LOGIN / SESSION ------------------ */
export const checkGoogleUser = createAsyncThunk(
  "auth/checkGoogleUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await account.get();
      if (!user) return rejectWithValue("No Google session");

      // Get role selected before Google login
      const roleFromNavbar = localStorage.getItem("selectedRole") || null;

      const res = await databases.listDocuments(DB, USERS_COLLECTION, [
        Query.equal("userId", user.$id),
      ]);

      let role = null;
      if (res.documents.length === 0) {
        // First-time Google login → create user with role
        await databases.createDocument(DB, USERS_COLLECTION, ID.unique(), {
          userId: user.$id,
          name: user.name,
          email: user.email,
          role: roleFromNavbar,
        });
        role = roleFromNavbar;
      } else {
        // Existing user → update role if different
        role = res.documents[0].role || roleFromNavbar;
        if (res.documents[0].role !== roleFromNavbar && roleFromNavbar) {
          await databases.updateDocument(DB, USERS_COLLECTION, res.documents[0].$id, {
            role: roleFromNavbar,
          });
          role = roleFromNavbar;
        }
      }

      // Clean up
      localStorage.removeItem("selectedRole");

      return { ...user, role };
    } catch (err) {
      return rejectWithValue(err.message || "Error fetching Google user");
    }
  }
);

/* ------------------ UPDATE ROLE ------------------ */
export const updateRole = createAsyncThunk(
  "auth/updateRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const res = await databases.listDocuments(DB, USERS_COLLECTION, [
        Query.equal("userId", userId),
      ]);
      if (!res.documents.length) throw new Error("User not found");

      await databases.updateDocument(DB, USERS_COLLECTION, res.documents[0].$id, { role });
      return role;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ------------------ LOGOUT ------------------ */
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await account.deleteSession("current");
  } catch (err) {
    return rejectWithValue(err.message || "Logout failed");
  }
});

/* ------------------ SLICE ------------------ */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: null,
    status: "idle",
    error: null,
  },
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* SIGNUP */
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

      /* LOGIN */
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

      /* GOOGLE LOGIN */
      .addCase(checkGoogleUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkGoogleUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.role = action.payload.role;
      })
      .addCase(checkGoogleUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.role = null;
        state.error = action.payload;
      })

      /* UPDATE ROLE */
      .addCase(updateRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.role = action.payload;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* LOGOUT */
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.role = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setRole } = authSlice.actions;
export default authSlice.reducer;
