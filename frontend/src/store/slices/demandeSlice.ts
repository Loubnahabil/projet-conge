import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { demandeApi } from "@/api/demandeApi";
import type { DemandeResponse, DemandeRequest, HistoryRecord } from "@/types/Demande.types";
import type { UserResponse } from "@/types/user.types";

interface DemandeState {
  demandes: DemandeResponse[];
  interims: UserResponse[];
  selectedHistory: HistoryRecord[];
  pendingChefVisas: DemandeResponse[];
  traiteesChef: DemandeResponse[];
  pendingSignatures: DemandeResponse[];
  traiteesSignataire: DemandeResponse[];
  loading: boolean;
  actionLoading: boolean;
  chefLoading: boolean;
  signataireLoading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  totalPages: number;
}

const initialState: DemandeState = {
  demandes: [],
  interims: [],
  selectedHistory: [],
  pendingChefVisas: [],
  traiteesChef: [],
  pendingSignatures: [],
  traiteesSignataire: [],
  loading: false,
  actionLoading: false,
  chefLoading: false,
  signataireLoading: false,
  error: null,
  page: 0,
  rowsPerPage: 10,
  totalElements: 0,
  totalPages: 0,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyDemandesThunk = createAsyncThunk(
  "demande/fetchMyDemandes",
  async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
    try {
      return await demandeApi.getMyDemandes(page, size);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.loadDemandes");
      return rejectWithValue(message);
    }
  },
);

export const fetchEligibleInterimsThunk = createAsyncThunk(
  "demande/fetchEligibleInterims",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getSameServiceColleagues();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.signatureError");
      return rejectWithValue(message);
    }
  },
);

export const createDemandeThunk = createAsyncThunk(
  "demande/create",
  async (
    { payload, submit }: { payload: DemandeRequest; submit: boolean },
    { rejectWithValue },
  ) => {
    try {
      return await demandeApi.create(payload, submit);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.createDemande");
      return rejectWithValue(message);
    }
  },
);

export const updateDemandeThunk = createAsyncThunk(
  "demande/update",
  async ({ id, payload }: { id: number; payload: DemandeRequest }, { rejectWithValue }) => {
    try {
      return await demandeApi.update(id, payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.updateDemande");
      return rejectWithValue(message);
    }
  },
);

export const soumettreDemandeThunk = createAsyncThunk(
  "demande/soumettre",
  async (id: number, { rejectWithValue }) => {
    try {
      return await demandeApi.soumettre(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.submitDemande");
      return rejectWithValue(message);
    }
  },
);

export const annulerDemandeThunk = createAsyncThunk(
  "demande/annuler",
  async (id: number, { rejectWithValue }) => {
    try {
      return await demandeApi.annulerDemande(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.cancelDemande");
      return rejectWithValue(message);
    }
  },
);

export const fetchDemandeHistoryThunk = createAsyncThunk(
  "demande/fetchHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandeHistory(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.loadHistorique");
      return rejectWithValue(message);
    }
  },
);

// ── Chef Thunks ──────────────────────────────────────────────────────────────

export const fetchPendingChefVisasThunk = createAsyncThunk(
  "demande/fetchPendingChefVisas",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesAViser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const fetchTraiteesChefThunk = createAsyncThunk(
  "demande/fetchTraiteesChef",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesTraiteesChef();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const visaChefThunk = createAsyncThunk(
  "demande/visaChef",
  async (
    { id, approve, commentaire }: { id: number; approve: boolean; commentaire?: string },
    { rejectWithValue },
  ) => {
    try {
      return await demandeApi.visaChef(id, approve, { commentaire });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.visaError");
      return rejectWithValue(message);
    }
  },
);

// ── Signataire Thunks ─────────────────────────────────────────────────────────

export const fetchPendingSignaturesThunk = createAsyncThunk(
  "demande/fetchPendingSignatures",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesASigner();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const fetchTraiteesSignataireThunk = createAsyncThunk(
  "demande/fetchTraiteesSignataire",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesTraiteesSignataire();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const signataireApproveThunk = createAsyncThunk(
  "demande/signataireApprove",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      return await demandeApi.uploadDocument(id, file, "DECISION_SIGNEE");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.signatureError");
      return rejectWithValue(message);
    }
  },
);

export const signataireRejectThunk = createAsyncThunk(
  "demande/signataireReject",
  async ({ id, commentaire }: { id: number; commentaire: string }, { rejectWithValue }) => {
    try {
      return await demandeApi.rejetSignataire(id, { commentaire });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i18next.t("errors.rejetError");
      return rejectWithValue(message);
    }
  },
);

// ── Slice Definition ─────────────────────────────────────────────────────────

const demandeSlice = createSlice({
  name: "demande",
  initialState,
  reducers: {
    clearDemandeError: (state) => {
      state.error = null;
    },
    clearSelectedHistory: (state) => {
      state.selectedHistory = [];
    },
    setDemandePage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setDemandeRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Demandes
      .addCase(fetchMyDemandesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyDemandesThunk.fulfilled,
        (
          state,
          action: PayloadAction<{
            content: DemandeResponse[];
            totalElements: number;
            totalPages: number;
            size: number;
            number: number;
          }>,
        ) => {
          state.loading = false;
          state.demandes = action.payload.content;
          state.totalElements = action.payload.totalElements;
          state.totalPages = action.payload.totalPages;
          state.rowsPerPage = action.payload.size;
          state.page = action.payload.number;
        },
      )
      .addCase(fetchMyDemandesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Interims
      .addCase(
        fetchEligibleInterimsThunk.fulfilled,
        (state, action: PayloadAction<UserResponse[]>) => {
          state.interims = action.payload;
        },
      )

      // Create Demande
      .addCase(createDemandeThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createDemandeThunk.fulfilled, (state, action: PayloadAction<DemandeResponse>) => {
        state.actionLoading = false;
        state.demandes.unshift(action.payload); // Add new to top of tracking list
      })
      .addCase(createDemandeThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Update Demande
      .addCase(updateDemandeThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateDemandeThunk.fulfilled, (state, action: PayloadAction<DemandeResponse>) => {
        state.actionLoading = false;
        const idx = state.demandes.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.demandes[idx] = action.payload;
      })
      .addCase(updateDemandeThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Soumettre Demande
      .addCase(soumettreDemandeThunk.fulfilled, (state, action: PayloadAction<DemandeResponse>) => {
        const idx = state.demandes.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.demandes[idx] = action.payload;
      })

      // Annuler Demande
      .addCase(annulerDemandeThunk.fulfilled, (state, action) => {
        const idx = state.demandes.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) {
          state.demandes[idx] = action.payload;
        } else {
          state.demandes = state.demandes.filter((d) => d.id !== action.meta.arg);
        }
      })

      // Fetch History
      .addCase(
        fetchDemandeHistoryThunk.fulfilled,
        (state, action: PayloadAction<HistoryRecord[]>) => {
          state.selectedHistory = action.payload;
        },
      )

      // ── Chef ────────────────────────────────────────────────
      .addCase(fetchPendingChefVisasThunk.pending, (state) => {
        state.chefLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingChefVisasThunk.fulfilled, (state, action) => {
        state.chefLoading = false;
        state.pendingChefVisas = action.payload;
      })
      .addCase(fetchPendingChefVisasThunk.rejected, (state, action) => {
        state.chefLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTraiteesChefThunk.fulfilled, (state, action) => {
        state.traiteesChef = action.payload;
      })
      .addCase(visaChefThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(visaChefThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingChefVisas = state.pendingChefVisas.filter((d) => d.id !== action.payload.id);
      })
      .addCase(visaChefThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // ── Signataire ───────────────────────────────────────────
      .addCase(fetchPendingSignaturesThunk.pending, (state) => {
        state.signataireLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingSignaturesThunk.fulfilled, (state, action) => {
        state.signataireLoading = false;
        state.pendingSignatures = action.payload;
      })
      .addCase(fetchPendingSignaturesThunk.rejected, (state, action) => {
        state.signataireLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTraiteesSignataireThunk.fulfilled, (state, action) => {
        state.traiteesSignataire = action.payload;
      })
      .addCase(signataireApproveThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(signataireApproveThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingSignatures = state.pendingSignatures.filter(
          (d) => d.id !== action.payload.demandeId,
        );
      })
      .addCase(signataireApproveThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signataireRejectThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(signataireRejectThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingSignatures = state.pendingSignatures.filter((d) => d.id !== action.payload.id);
      })
      .addCase(signataireRejectThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDemandeError, clearSelectedHistory, setDemandePage, setDemandeRowsPerPage } =
  demandeSlice.actions;
export default demandeSlice.reducer;
