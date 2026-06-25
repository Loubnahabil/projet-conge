import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auditApi } from "@/api/AuditApi";
import type { DemandeHistorique } from "@/types/Audit.types";

interface AuditState {
  entries: DemandeHistorique[];
  loading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  totalPages: number;
}

const initialState: AuditState = {
  entries: [],
  loading: false,
  error: null,
  page: 0,
  rowsPerPage: 20,
  totalElements: 0,
  totalPages: 0,
};

export const fetchJournalAudit = createAsyncThunk(
  "audit/fetchJournal",
  async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
    try {
      return await auditApi.getJournalAudit(page, size);
    } catch {
      return rejectWithValue(i18next.t("errors.loadAudit"));
    }
  },
);

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    cleanUpAudit: () => initialState,
    setAuditPage: (state, action) => {
      state.page = action.payload;
    },
    setAuditRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
      state.page = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalAudit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalAudit.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.content;
        state.page = action.payload.number;
        state.rowsPerPage = action.payload.size;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchJournalAudit.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || i18next.t("errors.operationError");
      });
  },
});

export const { cleanUpAudit, setAuditPage, setAuditRowsPerPage } = auditSlice.actions;
export default auditSlice.reducer;
