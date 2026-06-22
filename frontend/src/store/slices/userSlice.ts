import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { userApi } from "@/api/userApi";
import type { UserResponse, UserRequest } from "@/types/user.types";
import { extractError } from "@/utils/errorUtils";

interface UserState {
  list: UserResponse[];
  totalElements: number;
  page: number;
  rowsPerPage: number;
  searchQuery: string;
  globalLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  roles: { id: number; name: string }[];
}

const initialState: UserState = {
  list: [],
  totalElements: 0,
  page: 0,
  rowsPerPage: 10,
  searchQuery: "",
  globalLoading: true,
  actionLoading: false,
  error: null,
  roles: [],
};

export const fetchUsersList = createAsyncThunk(
  "users/fetchList",
  async (_, { getState, rejectWithValue }) => {
    const { users } = getState() as { users: UserState };
    try {
      const data = await userApi.getAll(users.searchQuery, users.page, users.rowsPerPage);
      return data;
    } catch {
      return rejectWithValue(i18next.t("errors.loadUsers"));
    }
  },
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await userApi.toggleEnabled(id);
      dispatch(fetchUsersList());
    } catch {
      return rejectWithValue(i18next.t("errors.toggleUserStatus"));
    }
  },
);

export const saveUser = createAsyncThunk(
  "users/save",
  async ({ payload, id }: { payload: UserRequest; id?: number }, { dispatch, rejectWithValue }) => {
    try {
      if (id) {
        await userApi.update(id, payload);
      } else {
        await userApi.create(payload);
      }
      dispatch(fetchUsersList());
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "errors.saveUser"));
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await userApi.delete(id);
      dispatch(fetchUsersList());
    } catch {
      return rejectWithValue(i18next.t("errors.deleteUserDependencies"));
    }
  },
);

export const fetchRoles = createAsyncThunk("users/fetchRoles", async (_, { rejectWithValue }) => {
  try {
    const roles = await userApi.getRoles();
    return roles;
  } catch {
    return rejectWithValue(i18next.t("errors.loadStructures"));
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<{ page: number; rowsPerPage: number }>) => {
      state.page = action.payload.page;
      state.rowsPerPage = action.payload.rowsPerPage;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersList.pending, (state) => {
        state.globalLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.list = action.payload.content || [];
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.globalLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveUser.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(saveUser.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(saveUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
        // NO alert()
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
      });
  },
});

export const { setPagination, setSearchQuery, clearError } = userSlice.actions;
export default userSlice.reducer;
