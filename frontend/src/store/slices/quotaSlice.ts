import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { quotaApi } from "@/api/quotaApi";
import type { QuotaResponseDTO } from "@/api/quotaApi";

import { axiosInstance } from "@/api/axiosInstance";

// 1. Extend the baseline type to handle user info and UI states
export interface ExtendedQuota extends QuotaResponseDTO {
  grade?: string;
}

interface QuotaState {
  list: ExtendedQuota[];
  globalLoading: boolean;
  actionLoading: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
}

const initialState: QuotaState = {
  list: [],
  globalLoading: false,
  actionLoading: false,
  feedback: null,
};

// 2. Thunk: Heavy lifting matrix compilation moved out of the Page lifecycle!
export const fetchQuotasMatrixThunk = createAsyncThunk(
  "quotas/fetchMatrix",
  async (year: number, { rejectWithValue }) => {
    try {
      // Fetch users list
      const usersResponse = await axiosInstance.get("/api/users");
      const workers = usersResponse.data.content || usersResponse.data;

      const compiledData: ExtendedQuota[] = [];

      // Safely check and loop through every worker to populate the matrix
      for (const user of workers) {
        try {
          const qData = await quotaApi.getQuotaByUserAndYear(user.id, year);
          compiledData.push({
            ...qData,
            grade: user.grade || i18next.t("quota.nonSpecifie"),
          });
        } catch {
          // If a quota entry is missing in DB for this year, generate the localized placeholder
          compiledData.push({
            id: -user.id, // Using negative tracking values for uninitialized entries
            userId: user.id,
            userNomComplet: `${user.prenom} ${user.nom}`,
            annee: year,
            joursAlloues: 30,
            joursUtilises: 0,
            joursRestants: 30,
            grade: user.grade || i18next.t("quota.nonSpecifie"),
          });
        }
      }
      return compiledData;
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Matrix Lifecycle
      .addCase(fetchQuotasMatrixThunk.pending, (state) => {
        state.globalLoading = true;
        state.feedback = null;
      })
      .addCase(
        fetchQuotasMatrixThunk.fulfilled,
        (state, action: PayloadAction<ExtendedQuota[]>) => {
          state.globalLoading = false;
          state.list = action.payload;
        },
      )
      .addCase(fetchQuotasMatrixThunk.rejected, (state, action) => {
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
        // Sync our local list state instantly with the updated item
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

export const { clearFeedback } = quotaSlice.actions;
export default quotaSlice.reducer;
