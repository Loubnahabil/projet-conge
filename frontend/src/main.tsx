import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store/index";
import AppRoutes from "@/routes/AppRoutes";
import { injectStore } from "@/api/axiosInstance"; // <-- Import the helper

injectStore(store);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  </React.StrictMode>,
);
