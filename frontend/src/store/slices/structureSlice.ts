import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { structureApi } from "@/api/structureApi";
import type {
  DirectionResponse,
  DivisionResponse,
  ServiceResponse,
  FullDirection,
  FullDivision,
  FullService,
} from "@/types/structure.types";

interface StructureState {
  directions: DirectionResponse[];
  divisions: DirectionResponse[]; // kept for StructurePage (full tree)
  services: ServiceResponse[]; // kept for StructurePage (full tree)
  currentDivisions: DivisionResponse[]; // lazy-loaded for UserFormModal
  currentServices: ServiceResponse[]; // lazy-loaded for UserFormModal
  roles: { id: number; name: string }[];
  treeData: FullDirection[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  popup: {
    isOpen: boolean;
    type: "direction" | "division" | "service" | null;
    mode: "create" | "edit";
    parentId: number | null;
    targetId: number | null;
    currentText: string;
  };
}

const initialState: StructureState = {
  directions: [],
  divisions: [],
  services: [],
  currentDivisions: [],
  currentServices: [],
  roles: [],
  treeData: [],
  loading: false,
  actionLoading: false,
  error: null,
  popup: {
    isOpen: false,
    type: null,
    mode: "create",
    parentId: null,
    targetId: null,
    currentText: "",
  },
};

export const fetchStructureDependenciesThunk = createAsyncThunk(
  "structure/fetchDependencies",
  async (_, { rejectWithValue }) => {
    try {
      const [dirs, divs, servs, roles] = await Promise.all([
        structureApi.getDirections(),
        structureApi.getDivisions(),
        structureApi.getServices(),
        structureApi.getRoles(),
      ]);
      return { dirs, divs, servs, roles };
    } catch {
      return rejectWithValue(i18next.t("errors.loadStructures"));
    }
  },
);

export const fetchDirectionsThunk = createAsyncThunk(
  "structure/fetchDirections",
  async (_, { rejectWithValue }) => {
    try {
      const dirs = await structureApi.getDirections();
      return dirs;
    } catch {
      return rejectWithValue(i18next.t("errors.loadStructures"));
    }
  },
);

export const fetchRolesThunk = createAsyncThunk(
  "structure/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const roles = await structureApi.getRoles();
      return roles;
    } catch {
      return rejectWithValue(i18next.t("errors.loadStructures"));
    }
  },
);

export const fetchDivisionsByDirectionThunk = createAsyncThunk(
  "structure/fetchDivisionsByDirection",
  async (directionId: number, { rejectWithValue }) => {
    try {
      return await structureApi.getDivisionsByDirection(directionId);
    } catch {
      return rejectWithValue(i18next.t("errors.loadStructures"));
    }
  },
);

export const fetchServicesByDivisionThunk = createAsyncThunk(
  "structure/fetchServicesByDivision",
  async (divisionId: number, { rejectWithValue }) => {
    try {
      return await structureApi.getServicesByDivision(divisionId);
    } catch {
      return rejectWithValue(i18next.t("errors.loadStructures"));
    }
  },
);

export const saveStructureNodeThunk = createAsyncThunk(
  "structure/saveNode",
  async (payload: { nom: string }, { getState, dispatch, rejectWithValue }) => {
    const { structure } = getState() as { structure: StructureState };
    const { mode, type, parentId, targetId } = structure.popup;

    try {
      if (mode === "create") {
        if (type === "direction") await structureApi.createDirection(payload.nom);
        else if (type === "division" && parentId)
          await structureApi.createDivision(parentId, payload.nom);
        else if (type === "service" && parentId)
          await structureApi.createService(parentId, payload.nom);
      } else if (mode === "edit" && targetId) {
        if (type === "direction") await structureApi.updateDirection(targetId, payload.nom);
        else if (type === "division" && parentId)
          await structureApi.updateDivision(targetId, parentId, payload.nom);
        else if (type === "service" && parentId)
          await structureApi.updateService(targetId, parentId, payload.nom);
      }
      dispatch(fetchStructureDependenciesThunk());
    } catch (err: unknown) {
      const message = err instanceof AxiosError ? (err.response?.data?.error as string) : i18next.t("errors.saveStructure");
      return rejectWithValue(message);
    }
  },
);

export const deleteStructureNodeThunk = createAsyncThunk(
  "structure/deleteNode",
  async (
    payload: { type: "direction" | "division" | "service"; id: number },
    { dispatch, rejectWithValue },
  ) => {
    try {
      if (payload.type === "direction") await structureApi.deleteDirection(payload.id);
      if (payload.type === "division") await structureApi.deleteDivision(payload.id);
      if (payload.type === "service") await structureApi.deleteService(payload.id);
      dispatch(fetchStructureDependenciesThunk());
    } catch (err: unknown) {
      const message = err instanceof AxiosError ? (err.response?.data?.error as string) : i18next.t("errors.deleteStructure");
      return rejectWithValue(message);
    }
  },
);

const structureSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {
    openStructurePopup: (
      state,
      action: PayloadAction<{
        mode: "create" | "edit";
        type: "direction" | "division" | "service";
        parentId?: number | null;
        targetId?: number | null;
        currentText?: string;
      }>,
    ) => {
      state.popup = {
        isOpen: true,
        type: action.payload.type,
        mode: action.payload.mode,
        parentId: action.payload.parentId ?? null,
        targetId: action.payload.targetId ?? null,
        currentText: action.payload.currentText ?? "",
      };
    },
    closeStructurePopup: (state) => {
      state.popup = initialState.popup;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStructureDependenciesThunk.pending, (state) => {
        state.loading = true;
        state.error = null; // Clean up old errors when re-fetching
      })
      .addCase(fetchStructureDependenciesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.directions = action.payload.dirs;
        state.divisions = action.payload.divs;
        state.services = action.payload.servs;
        state.roles = action.payload.roles;

        state.treeData = action.payload.dirs.map((dir) => {
          const matchingDivisions = action.payload.divs
            .filter((div) => div.directionId === dir.id)
            .map((div) => {
              const matchingServices = action.payload.servs.filter(
                (ser) => ser.divisionId === div.id,
              ) as FullService[];
              return { ...div, services: matchingServices } as FullDivision;
            });
          return { ...dir, divisions: matchingDivisions } as FullDirection;
        });
      })
      .addCase(fetchStructureDependenciesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || i18next.t("errors.operationError");
      })

      .addCase(fetchDirectionsThunk.fulfilled, (state, action) => {
        state.directions = action.payload;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.roles = action.payload;
      })
      .addCase(fetchDivisionsByDirectionThunk.fulfilled, (state, action) => {
        state.currentDivisions = action.payload;
      })
      .addCase(fetchServicesByDivisionThunk.fulfilled, (state, action) => {
        state.currentServices = action.payload;
      })

      // Matchers for action handling
      .addMatcher(
        (action) => action.type.endsWith("/pending") && !action.type.includes("fetchDependencies"),
        (state) => {
          state.actionLoading = true;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") && !action.type.includes("fetchDependencies"),
        (state) => {
          state.actionLoading = false;
          state.popup = initialState.popup;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected") && !action.type.includes("fetchDependencies"),
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = false;
          state.error = action.payload || i18next.t("errors.operationImpossible");
        },
      );
  },
});

export const { openStructurePopup, closeStructurePopup } = structureSlice.actions;
export default structureSlice.reducer;
