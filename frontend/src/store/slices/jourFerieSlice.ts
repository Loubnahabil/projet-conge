import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { jourFerieApi } from "@/api/jourFerieApi";
import type { JourFerieResponseDTO } from "@/types/jourFerie.types";

interface JourFerieState {
  list: JourFerieResponseDTO[];
  globalLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  popup: {
    isOpen: boolean;
    mode: "create" | "edit";
    targetItem: JourFerieResponseDTO | null;
  };
}

const initialState: JourFerieState = {
  list: [],
  globalLoading: true,
  actionLoading: false,
  error: null,
  popup: {
    isOpen: false,
    mode: "create",
    targetItem: null,
  },
};

// 🌟 Async Thunks
export const fetchHolidaysThunk = createAsyncThunk(
  "jourFerie/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await jourFerieApi.getAll();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : i18next.t("errors.loadHolidays");

      return rejectWithValue(message);
    }
  },
);

export const createHolidayThunk = createAsyncThunk(
  "jourFerie/create",
  async (
    payload: { date: string; libelle: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await jourFerieApi.create(payload.date, payload.libelle);

      dispatch(fetchHolidaysThunk());
      return response;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : i18next.t("errors.createHoliday");

      return rejectWithValue(message);
    }
  },
);

export const updateHolidayThunk = createAsyncThunk(
  "jourFerie/update",
  async (
    payload: { id: number; date: string; libelle: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await jourFerieApi.update(
        payload.id,
        payload.date,
        payload.libelle,
      );

      dispatch(fetchHolidaysThunk());
      return response;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : i18next.t("errors.updateHoliday");

      return rejectWithValue(message);
    }
  },
);

export const deleteHolidayThunk = createAsyncThunk(
  "jourFerie/delete",
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await jourFerieApi.delete(id);
      dispatch(fetchHolidaysThunk());
      return id;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : i18next.t("errors.deleteHoliday");

      return rejectWithValue(message);
    }
  },
);

const jourFerieSlice = createSlice({
  name: "jourFerie",
  initialState,
  reducers: {
    openHolidayPopup: (
      state,
      action: PayloadAction<{
        mode: "create" | "edit";
        item?: JourFerieResponseDTO;
      }>,
    ) => {
      state.popup.isOpen = true;
      state.popup.mode = action.payload.mode;
      state.popup.targetItem = action.payload.item || null;
    },

    closeHolidayPopup: (state) => {
      state.popup.isOpen = false;
      state.popup.mode = "create";
      state.popup.targetItem = null;
    },

    clearHolidayError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHolidaysThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchHolidaysThunk.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchHolidaysThunk.rejected, (state, action) => {
        state.globalLoading = false;
        state.error = action.payload as string;
      })

      // Generic loading for create/update/delete
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && !action.type.includes("fetchAll"),
        (state) => {
          state.actionLoading = true;
        },
      )

      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          !action.type.includes("fetchAll"),
        (state) => {
          state.actionLoading = false;
          state.popup.isOpen = false;
          state.popup.targetItem = null;
        },
      )

      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          !action.type.includes("fetchAll"),
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = false;
          state.error =
            action.payload || i18next.t("errors.operationalError");
        },
      );
  },
});

export const { openHolidayPopup, closeHolidayPopup, clearHolidayError } =
  jourFerieSlice.actions;

export default jourFerieSlice.reducer;
