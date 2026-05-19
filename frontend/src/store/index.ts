import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    // state.auth will contain everything from authSlice
    auth: authReducer,
  },
});
export type AppStore = typeof store;
// TypeScript types for Redux
// RootState = shape of entire state { auth: AuthState }
// AppDispatch = type of dispatch function
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
