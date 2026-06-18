import i18next from "i18next";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { userApi } from "@/api/userApi";
import type { UserResponse, UserRequest } from "@/types/user.types";

interface UserState {
  list: UserResponse[];
  totalElements: number;
  page: number;
  rowsPerPage: number;
  searchQuery: string;
  globalLoading: boolean;
  actionLoading: boolean;
  error: string | null;
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
};

export const fetchUsersListThunk = createAsyncThunk(
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

export const toggleUserStatusThunk = createAsyncThunk(
  "users/toggleStatus",
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await userApi.toggleEnabled(id);
      dispatch(fetchUsersListThunk());
    } catch {
      return rejectWithValue(i18next.t("errors.toggleUserStatus"));
    }
  },
);

export const saveUserThunk = createAsyncThunk(
  "users/save",
  async ({ payload, id }: { payload: UserRequest; id?: number }, { dispatch, rejectWithValue }) => {
    try {
      if (id) {
        await userApi.update(id, payload);
      } else {
        await userApi.create(payload);
      }
      dispatch(fetchUsersListThunk());
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const message =
        e.response?.data?.message || e.response?.data?.error || i18next.t("errors.saveUser");
      return rejectWithValue(message);
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await userApi.delete(id);
      dispatch(fetchUsersListThunk());
    } catch {
      return rejectWithValue(i18next.t("errors.deleteUserDependencies"));
    }
  },
);

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
      .addCase(fetchUsersListThunk.pending, (state) => {
        state.globalLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersListThunk.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.list = action.payload.content || [];
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchUsersListThunk.rejected, (state, action) => {
        state.globalLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveUserThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(saveUserThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(saveUserThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
        // NO alert()
      })
      .addCase(toggleUserStatusThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setPagination, setSearchQuery, clearError } = userSlice.actions;
export default userSlice.reducer;
