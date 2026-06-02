import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../api/authApi";
import type { AuthState, LoginRequest } from "../../types/auth.types";
import axios from "axios";

// ✅ read from localStorage on page load so refresh doesn't wipe state
const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      return data;
    } catch (error: unknown) {
      // ✅ Use Axios type guard to cleanly extract the backend error message
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error || "Erreur de connexion",
        );
      }

      // Fallback for generic/network errors
      return rejectWithValue("Erreur de connexion");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      // ✅ clear localStorage on logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
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
        // ✅ save to localStorage so refresh doesn't wipe state
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: action.payload.email,
            nom: action.payload.nom,
            prenom: action.payload.prenom,
            role: action.payload.role,
          }),
        );
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
