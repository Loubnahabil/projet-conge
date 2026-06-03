import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import quotaReducer from "./slices/quotaSlice";
import structureReducer from "./slices/structureSlice";
import userReducer from "./slices/userSlice";
import jourFerieReducer from "./slices/jourFerieSlice";
import auditReducer from "./slices/auditSlice";
import statsReducer from "./slices/statsSlice";
import demandeReducer from "./slices/demandeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quotas: quotaReducer,
    structure: structureReducer,
    users: userReducer, //
    jourFerie: jourFerieReducer,
    audit: auditReducer,
    stats: statsReducer,
    demande: demandeReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
