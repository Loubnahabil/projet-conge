import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { demandeApi } from "../../api/demandeApi";
import type {
  DemandeResponse,
  DemandeRequest,
  HistoryRecord,
} from "../../types/Demande.types";
import type { UserResponseDTO } from "../../types/user.types";

interface DemandeState {
  demandes: DemandeResponse[];
  interims: UserResponseDTO[];
  selectedHistory: HistoryRecord[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: DemandeState = {
  demandes: [],
  interims: [],
  selectedHistory: [],
  loading: false,
  actionLoading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyDemandesThunk = createAsyncThunk(
  "demande/fetchMyDemandes",
  async (_, { rejectWithValue }) => {
    try {
      return await demandeApi.getMyDemandes();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de charger vos demandes.";
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
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de charger la liste des intérimaires.";
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
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la demande.";
      return rejectWithValue(message);
    }
  },
);

export const updateDemandeThunk = createAsyncThunk(
  "demande/update",
  async (
    { id, payload }: { id: number; payload: DemandeRequest },
    { rejectWithValue },
  ) => {
    try {
      return await demandeApi.update(id, payload);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la modification de la demande.";
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
      const message =
        err instanceof Error ? err.message : "Erreur lors de la soumission.";
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
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'annulation.";
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
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de charger l'historique.";
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
        (state, action: PayloadAction<DemandeResponse[]>) => {
          state.loading = false;
          state.demandes = action.payload;
        },
      )
      .addCase(fetchMyDemandesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Interims
      .addCase(
        fetchEligibleInterimsThunk.fulfilled,
        (state, action: PayloadAction<UserResponseDTO[]>) => {
          state.interims = action.payload;
        },
      )

      // Create Demande
      .addCase(createDemandeThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(
        createDemandeThunk.fulfilled,
        (state, action: PayloadAction<DemandeResponse>) => {
          state.actionLoading = false;
          state.demandes.unshift(action.payload); // Add new to top of tracking list
        },
      )
      .addCase(createDemandeThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Update Demande
      .addCase(updateDemandeThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(
        updateDemandeThunk.fulfilled,
        (state, action: PayloadAction<DemandeResponse>) => {
          state.actionLoading = false;
          const idx = state.demandes.findIndex(
            (d) => d.id === action.payload.id,
          );
          if (idx !== -1) state.demandes[idx] = action.payload;
        },
      )
      .addCase(updateDemandeThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      // Soumettre Demande
      .addCase(
        soumettreDemandeThunk.fulfilled,
        (state, action: PayloadAction<DemandeResponse>) => {
          const idx = state.demandes.findIndex(
            (d) => d.id === action.payload.id,
          );
          if (idx !== -1) state.demandes[idx] = action.payload;
        },
      )

      // Annuler Demande
      .addCase(annulerDemandeThunk.fulfilled, (state, action) => {
        const idx = state.demandes.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) {
          state.demandes[idx] = action.payload;
        } else {
          state.demandes = state.demandes.filter(
            (d) => d.id !== action.meta.arg,
          );
        }
      })

      // Fetch History
      .addCase(
        fetchDemandeHistoryThunk.fulfilled,
        (state, action: PayloadAction<HistoryRecord[]>) => {
          state.selectedHistory = action.payload;
        },
      );
  },
});

export const { clearDemandeError, clearSelectedHistory } = demandeSlice.actions;
export default demandeSlice.reducer;
