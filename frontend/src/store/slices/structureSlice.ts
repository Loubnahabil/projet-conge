import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { structureApi } from "@/api/structureApi";
import { extractError } from "@/utils/errorUtils";
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
  divisions: DivisionResponse[];
  services: ServiceResponse[];
  currentDivisions: DivisionResponse[];
  currentServices: ServiceResponse[];
  treeData: FullDirection[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: StructureState = {
  directions: [],
  divisions: [],
  services: [],
  currentDivisions: [],
  currentServices: [],
  treeData: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchStructureDependenciesThunk = createAsyncThunk(
  "structure/fetchDependencies",
  async (_, { rejectWithValue }) => {
    try {
      const [dirs, divs, servs] = await Promise.all([
        structureApi.getDirections(),
        structureApi.getDivisions(),
        structureApi.getServices(),
      ]);
      return { dirs, divs, servs };
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
  async (
    payload: {
      nom: string;
      mode: "create" | "edit";
      type: "direction" | "division" | "service";
      parentId?: number | null;
      targetId?: number | null;
    },
    { dispatch, rejectWithValue },
  ) => {
    const { nom, mode, type, parentId, targetId } = payload;

    try {
      if (mode === "create") {
        if (type === "direction") await structureApi.createDirection(nom);
        else if (type === "division" && parentId) await structureApi.createDivision(parentId, nom);
        else if (type === "service" && parentId) await structureApi.createService(parentId, nom);
      } else if (mode === "edit" && targetId) {
        if (type === "direction") await structureApi.updateDirection(targetId, nom);
        else if (type === "division" && parentId)
          await structureApi.updateDivision(targetId, parentId, nom);
        else if (type === "service" && parentId)
          await structureApi.updateService(targetId, parentId, nom);
      }
      dispatch(fetchStructureDependenciesThunk());
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "errors.saveStructure"));
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
      return rejectWithValue(extractError(err, "errors.deleteStructure"));
    }
  },
);

const structureSlice = createSlice({
  name: "structure",
  initialState,
  reducers: {},
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

export default structureSlice.reducer;
