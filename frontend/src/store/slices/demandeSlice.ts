import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { extractError } from "@/utils/errorUtils";
import { demandeApi } from "@/api/demandeApi";
import { DOCUMENT_TYPE } from "@/constants/constants";
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

// ── Async s ─────────────────────────────────────────────────────────────

export const fetchMyDemandes = createAsyncThunk(
  "demande/fetchMyDemandes",
  async ({ page, size }: { page: number; size: number }, { rejectWithValue }) => {
    try {
      return await demandeApi.getMyDemandes(page, size);
    } catch (err: unknown) {
      const message = extractError(err, "errors.loadDemandes");
      return rejectWithValue(message);
    }
  },
);

export const fetchEligibleInterims = createAsyncThunk(
  "demande/fetchEligibleInterims",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getSameServiceColleagues();
    } catch (err: unknown) {
      const message = extractError(err, "errors.signatureError");
      return rejectWithValue(message);
    }
  },
);

export const createDemande = createAsyncThunk(
  "demande/create",
  async (
    { payload, submit }: { payload: DemandeRequest; submit: boolean },
    { rejectWithValue },
  ) => {
    try {
      return await demandeApi.create(payload, submit);
    } catch (err: unknown) {
      const message = extractError(err, "errors.createDemande");
      return rejectWithValue(message);
    }
  },
);

export const updateDemande = createAsyncThunk(
  "demande/update",
  async ({ id, payload }: { id: number; payload: DemandeRequest }, { rejectWithValue }) => {
    try {
      return await demandeApi.update(id, payload);
    } catch (err: unknown) {
      const message = extractError(err, "errors.updateDemande");
      return rejectWithValue(message);
    }
  },
);

export const soumettreDemande = createAsyncThunk(
  "demande/soumettre",
  async (id: number, { rejectWithValue }) => {
    try {
      return await demandeApi.soumettre(id);
    } catch (err: unknown) {
      const message = extractError(err, "errors.submitDemande");
      return rejectWithValue(message);
    }
  },
);

export const annulerDemande = createAsyncThunk(
  "demande/annuler",
  async (id: number, { rejectWithValue }) => {
    try {
      return await demandeApi.annulerDemande(id);
    } catch (err: unknown) {
      const message = extractError(err, "errors.cancelDemande");
      return rejectWithValue(message);
    }
  },
);

export const fetchDemandeHistory = createAsyncThunk(
  "demande/fetchHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandeHistory(id);
    } catch (err: unknown) {
      const message = extractError(err, "errors.loadHistorique");
      return rejectWithValue(message);
    }
  },
);

// ── Chef s ──────────────────────────────────────────────────────────────

export const fetchPendingChefVisas = createAsyncThunk(
  "demande/fetchPendingChefVisas",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesAViser();
    } catch (err: unknown) {
      const message = extractError(err, "errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const fetchTraiteesChef = createAsyncThunk(
  "demande/fetchTraiteesChef",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesTraiteesChef();
    } catch (err: unknown) {
      const message = extractError(err, "errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const visaChef = createAsyncThunk(
  "demande/visaChef",
  async (
    { id, approve, commentaire }: { id: number; approve: boolean; commentaire?: string },
    { rejectWithValue },
  ) => {
    try {
      return await demandeApi.visaChef(id, approve, { commentaire });
    } catch (err: unknown) {
      const message = extractError(err, "errors.visaError");
      return rejectWithValue(message);
    }
  },
);

// ── Signataire s ─────────────────────────────────────────────────────────

export const fetchPendingSignatures = createAsyncThunk(
  "demande/fetchPendingSignatures",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesASigner();
    } catch (err: unknown) {
      const message = extractError(err, "errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const fetchTraiteesSignataire = createAsyncThunk(
  "demande/fetchTraiteesSignataire",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getDemandesTraiteesSignataire();
    } catch (err: unknown) {
      const message = extractError(err, "errors.loadData");
      return rejectWithValue(message);
    }
  },
);

export const signataireApprove = createAsyncThunk(
  "demande/signataireApprove",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      return await demandeApi.uploadDocument(id, file, DOCUMENT_TYPE.DECISION_SIGNEE);
    } catch (err: unknown) {
      const message = extractError(err, "errors.signatureError");
      return rejectWithValue(message);
    }
  },
);

export const signataireReject = createAsyncThunk(
  "demande/signataireReject",
  async ({ id, commentaire }: { id: number; commentaire: string }, { rejectWithValue }) => {
    try {
      return await demandeApi.rejetSignataire(id, { commentaire });
    } catch (err: unknown) {
      const message = extractError(err, "errors.rejetError");
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
      .addCase(fetchMyDemandes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyDemandes.fulfilled,
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
      .addCase(fetchMyDemandes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Interims
      .addCase(
        fetchEligibleInterims.fulfilled,
        (state, action: PayloadAction<UserResponse[]>) => {
          state.interims = action.payload;
        },
      )

      // Create Demande
      .addCase(createDemande.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createDemande.fulfilled, (state, action: PayloadAction<DemandeResponse>) => {
        state.actionLoading = false;
        state.demandes.unshift(action.payload); // Add new to top of tracking list
      })
      .addCase(createDemande.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Update Demande
      .addCase(updateDemande.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateDemande.fulfilled, (state, action: PayloadAction<DemandeResponse>) => {
        state.actionLoading = false;
        const idx = state.demandes.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.demandes[idx] = action.payload;
      })
      .addCase(updateDemande.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Soumettre Demande
      .addCase(soumettreDemande.fulfilled, (state, action: PayloadAction<DemandeResponse>) => {
        const idx = state.demandes.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.demandes[idx] = action.payload;
      })

      // Annuler Demande
      .addCase(annulerDemande.fulfilled, (state, action) => {
        const idx = state.demandes.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) {
          state.demandes[idx] = action.payload;
        } else {
          state.demandes = state.demandes.filter((d) => d.id !== action.meta.arg);
        }
      })

      // Fetch History
      .addCase(
        fetchDemandeHistory.fulfilled,
        (state, action: PayloadAction<HistoryRecord[]>) => {
          state.selectedHistory = action.payload;
        },
      )

      // ── Chef ────────────────────────────────────────────────
      .addCase(fetchPendingChefVisas.pending, (state) => {
        state.chefLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingChefVisas.fulfilled, (state, action) => {
        state.chefLoading = false;
        state.pendingChefVisas = action.payload;
      })
      .addCase(fetchPendingChefVisas.rejected, (state, action) => {
        state.chefLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTraiteesChef.fulfilled, (state, action) => {
        state.traiteesChef = action.payload;
      })
      .addCase(visaChef.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(visaChef.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingChefVisas = state.pendingChefVisas.filter((d) => d.id !== action.payload.id);
      })
      .addCase(visaChef.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // ── Signataire ───────────────────────────────────────────
      .addCase(fetchPendingSignatures.pending, (state) => {
        state.signataireLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingSignatures.fulfilled, (state, action) => {
        state.signataireLoading = false;
        state.pendingSignatures = action.payload;
      })
      .addCase(fetchPendingSignatures.rejected, (state, action) => {
        state.signataireLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTraiteesSignataire.fulfilled, (state, action) => {
        state.traiteesSignataire = action.payload;
      })
      .addCase(signataireApprove.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(signataireApprove.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingSignatures = state.pendingSignatures.filter(
          (d) => d.id !== action.payload.demandeId,
        );
      })
      .addCase(signataireApprove.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signataireReject.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(signataireReject.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingSignatures = state.pendingSignatures.filter((d) => d.id !== action.payload.id);
      })
      .addCase(signataireReject.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDemandeError, clearSelectedHistory, setDemandePage, setDemandeRowsPerPage } =
  demandeSlice.actions;
export default demandeSlice.reducer;
