import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../src/api/axiosClient";

/* ===========================
   🔐 REGISTER
=========================== */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ===========================
   🔐 LOGIN
=========================== */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ===========================
   🔎 CHECK AUTH (cookie based)
=========================== */
export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/user/check");
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unauthorized"
      );
    }
  }
);

/* ===========================
   🚪 LOGOUT (async - calls backend)
=========================== */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ===========================
   🧠 SLICE
=========================== */
const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    isAuthenticated: true,
    loading: false,
    error: null,
  },

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    // ✅ FIX: Added synchronous logout action for immediate local state reset
    // Use this when you don't need to call the backend (e.g., token already expired)
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    updateUserProfilePic: (state, action) => {
      if (state.user) {
        state.user.profilePic = action.payload;
      }
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= REGISTER ================= */

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true; // user must login after registration
        state.user = null;
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
        state.isAuthenticated = false;
        state.user = null;
      })

      /* ================= LOGIN ================= */

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
        state.user = null;
      })

      /* ================= CHECK AUTH ================= */

      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null; // ✅ FIX: Don't store error on failed auth check (normal for unauthenticated users)
      })

      /* ================= LOGOUT ================= */

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // ✅ FIX: Still clear user state even if backend logout fails
        // (cookie may have expired, but we should still log out locally)
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { updateUserProfilePic, setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;