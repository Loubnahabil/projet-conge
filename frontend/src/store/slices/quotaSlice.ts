import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { quotaApi } from "@/api/quotaApi";
import type { QuotaResponse } from "@/api/quotaApi";
import type { SpringPageWrapper } from "@/types/user.types";

interface QuotaState {
  list: QuotaResponse[];
  page: number;
  rowsPerPage: number;
  totalElements: number;
  totalPages: number;
  globalLoading: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
}

const initialState: QuotaState = {
  list: [],
  page: 0,
  rowsPerPage: 10,
  totalElements: 0,
  totalPages: 0,
  globalLoading: false,
  feedback: null,
};

export const fetchQuotasPageThunk = createAsyncThunk(
  "quotas/fetchPage",
  async (
    { year, page, size }: { year: number; page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const data: SpringPageWrapper<QuotaResponse> = await quotaApi.getQuotasPage(year, page, size);
      return data;
    } catch {
      return rejectWithValue(i18next.t("errors.loadQuotas"));
    }
  },
);

const quotaSlice = createSlice({
  name: "quotas",
  initialState,
  reducers: {
    clearFeedback: (state) => {
      state.feedback = null;
    },
    setQuotaPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setQuotaRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotasPageThunk.pending, (state) => {
        state.globalLoading = true;
        state.feedback = null;
      })
      .addCase(
        fetchQuotasPageThunk.fulfilled,
        (state, action: PayloadAction<SpringPageWrapper<QuotaResponse>>) => {
          state.globalLoading = false;
          state.list = action.payload.content;
          state.totalElements = action.payload.totalElements;
          state.totalPages = action.payload.totalPages;
        },
      )
      .addCase(fetchQuotasPageThunk.rejected, (state, action) => {
        state.globalLoading = false;
        state.feedback = { type: "error", text: action.payload as string };
      });
  },
});

export const { clearFeedback, setQuotaPage, setQuotaRowsPerPage } = quotaSlice.actions;
export default quotaSlice.reducer;
