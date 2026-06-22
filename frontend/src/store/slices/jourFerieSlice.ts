import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { AxiosError } from "axios";
import { extractError } from "@/utils/errorUtils";
import { jourFerieApi } from "@/api/jourFerieApi";
import type { JourFerieResponse } from "@/types/jourFerie.types";

interface JourFerieState {
  list: JourFerieResponse[];
  globalLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: JourFerieState = {
  list: [],
  globalLoading: true,
  actionLoading: false,
  error: null,
};

// 🌟 Async s
export const fetchHolidays = createAsyncThunk(
  "jourFerie/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await jourFerieApi.getAll();
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "errors.loadHolidays"));
    }
  },
);

export const createHoliday = createAsyncThunk(
  "jourFerie/create",
  async (payload: { date: string; libelle: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await jourFerieApi.create(payload.date, payload.libelle);

      dispatch(fetchHolidays());
      return response;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "errors.createHoliday"));
    }
  },
);

export const updateHoliday = createAsyncThunk(
  "jourFerie/update",
  async (payload: { id: number; date: string; libelle: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await jourFerieApi.update(payload.id, payload.date, payload.libelle);

      dispatch(fetchHolidays());
      return response;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "errors.updateHoliday"));
    }
  },
);

export const deleteHoliday = createAsyncThunk(
  "jourFerie/delete",
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await jourFerieApi.delete(id);
      dispatch(fetchHolidays());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "errors.deleteHoliday"));
    }
  },
);

const jourFerieSlice = createSlice({
  name: "jourFerie",
  initialState,
  reducers: {
    clearHolidayError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHolidays.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.globalLoading = false;
        state.error = action.payload as string;
      })

      // Generic loading for create/update/delete
      .addMatcher(
        (action) => action.type.endsWith("/pending") && !action.type.includes("fetchAll"),
        (state) => {
          state.actionLoading = true;
        },
      )

      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") && !action.type.includes("fetchAll"),
        (state) => {
          state.actionLoading = false;
        },
      )

      .addMatcher(
        (action) => action.type.endsWith("/rejected") && !action.type.includes("fetchAll"),
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = false;
          state.error = action.payload || i18next.t("errors.operationalError");
        },
      );
  },
});

export const { clearHolidayError } = jourFerieSlice.actions;

export default jourFerieSlice.reducer;
