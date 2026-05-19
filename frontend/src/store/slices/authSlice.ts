import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../api/authApi";
import type { AuthState, LoginRequest } from "../../types/auth.types";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// THUNK — calls authApi.login then Redux stores the result
// 3 automatic states: pending, fulfilled, rejected
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      return data;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as {
          response?: {
            data?: {
              error?: string;
            };
          };
        };

        return rejectWithValue(
          err.response?.data?.error || "Erreur de connexion",
        );
      }

      return rejectWithValue("Erreur de connexion");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // normal reducer — clears state on logout
    // no API call needed here, just clear Redux
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
    },

    // normal reducer — clears error when user retypes
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login started → show loading spinner
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // login succeeded → store everything
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = {
          email: action.payload.email,
          nom: action.payload.nom,
          prenom: action.payload.prenom,
          role: action.payload.role,
        };
      })
      // login failed → store error message
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
