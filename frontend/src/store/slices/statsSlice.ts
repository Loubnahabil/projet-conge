import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { statsApi } from "@/api/Statsapi";
import type { DashboardStatsResponse } from "@/types/Stats.types";

interface StatsState {
  data: DashboardStatsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboardStatsThunk = createAsyncThunk(
  "stats/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await statsApi.getDashboard();
    } catch {
      return rejectWithValue("Impossible de charger les statistiques.");
    }
  },
);

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Une erreur est survenue.";
      });
  },
});

export default statsSlice.reducer;
