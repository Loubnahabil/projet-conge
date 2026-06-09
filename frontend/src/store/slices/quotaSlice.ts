import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { quotaApi } from "@/api/quotaApi";
import type { QuotaResponse } from "@/api/quotaApi";
import type { SpringPageWrapper } from "@/types/user.types";

// 1. Re-export for components that used the old ExtendedQuota name
export type ExtendedQuota = QuotaResponse;

interface QuotaState {
  list: ExtendedQuota[];
  page: number;
  rowsPerPage: number;
  totalElements: number;
  totalPages: number;
  globalLoading: boolean;
  actionLoading: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
}

const initialState: QuotaState = {
  list: [],
  page: 0,
  rowsPerPage: 10,
  totalElements: 0,
  totalPages: 0,
  globalLoading: false,
  actionLoading: false,
  feedback: null,
};

// 2. Thunk: Uses the server-side paginated endpoint (single query)
export const fetchQuotasPageThunk = createAsyncThunk(
  "quotas/fetchPage",
  async (
    { year, page, size }: { year: number; page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const data: SpringPageWrapper<QuotaResponse> =
        await quotaApi.getQuotasPage(year, page, size);
      return data;
    } catch {
      return rejectWithValue(i18next.t("errors.loadQuotas"));
    }
  },
);

// 3. Thunk: Secure Inline Row Modification
export const updateQuotaThunk = createAsyncThunk(
  "quotas/updateRow",
  async (
    {
      id,
      joursAlloues,
      joursUtilises,
    }: { id: number; joursAlloues: number; joursUtilises: number },
    { rejectWithValue },
  ) => {
    try {
      const updatedData = await quotaApi.updateQuota(id, {
        joursAlloues,
        joursUtilises,
      });
      return updatedData;
    } catch {
      return rejectWithValue(i18next.t("errors.updateQuota"));
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
      // Fetch Page Lifecycle
      .addCase(fetchQuotasPageThunk.pending, (state) => {
        state.globalLoading = true;
        state.feedback = null;
      })
      .addCase(
        fetchQuotasPageThunk.fulfilled,
        (
          state,
          action: PayloadAction<SpringPageWrapper<QuotaResponse>>,
        ) => {
          state.globalLoading = false;
          state.list = action.payload.content;
          state.totalElements = action.payload.totalElements;
          state.totalPages = action.payload.totalPages;
        },
      )
      .addCase(fetchQuotasPageThunk.rejected, (state, action) => {
        state.globalLoading = false;
        state.feedback = { type: "error", text: action.payload as string };
      })

      // Update Row Lifecycle
      .addCase(updateQuotaThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateQuotaThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.feedback = {
          type: "success",
          text: i18next.t("quota.updateSuccess"),
        };
        state.list = state.list.map((q) =>
          q.id === action.payload.id ? { ...q, ...action.payload } : q,
        );
      })
      .addCase(updateQuotaThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.feedback = { type: "error", text: action.payload as string };
      });
  },
});

export const { clearFeedback, setQuotaPage, setQuotaRowsPerPage } =
  quotaSlice.actions;
export default quotaSlice.reducer;
