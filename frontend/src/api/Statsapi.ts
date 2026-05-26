// src/api/statsApi.ts

import { axiosInstance } from "./axiosInstance";
import type { DashboardStatsResponse } from "../types/Stats.types";

export const statsApi = {
  getDashboard: async (): Promise<DashboardStatsResponse> => {
    const response = await axiosInstance.get<DashboardStatsResponse>(
      "/api/statistiques/dashboard",
    );
    return response.data;
  },
};
