import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auditApi } from "@/api/AuditApi";
import type { DemandeHistoriqueDTO } from "@/types/Audit.types";

interface AuditState {
  entries: DemandeHistoriqueDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: AuditState = {
  entries: [],
  loading: false,
  error: null,
};

export const fetchJournalAuditThunk = createAsyncThunk(
  "audit/fetchJournal",
  async (_, { rejectWithValue }) => {
    try {
      return await auditApi.getJournalAudit();
    } catch {
      return rejectWithValue(i18next.t("errors.loadAudit"));
    }
  },
);

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalAuditThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalAuditThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchJournalAuditThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || i18next.t("errors.operationError");
      });
  },
});

export default auditSlice.reducer;
