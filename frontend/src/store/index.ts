import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import quotaReducer from "@/store/slices/quotaSlice";
import structureReducer from "@/store/slices/structureSlice";
import userReducer from "@/store/slices/userSlice";
import jourFerieReducer from "@/store/slices/jourFerieSlice";
import auditReducer from "@/store/slices/auditSlice";
import statsReducer from "@/store/slices/statsSlice";
import demandeReducer from "@/store/slices/demandeSlice";

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
