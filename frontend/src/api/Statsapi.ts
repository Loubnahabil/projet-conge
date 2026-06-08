import { axiosInstance } from "@/api/axiosInstance";
import type {
  DashboardStatsResponse,
  FonctionnaireDashboardStats,
  ChefDashboardStats,
  SignataireDashboardStats,
} from "@/types/Stats.types";

export const statsApi = {
  getDashboard: async (): Promise<DashboardStatsResponse> => {
    const response = await axiosInstance.get<DashboardStatsResponse>(
      "/api/statistiques/dashboard",
    );
    return response.data;
  },

  getFonctionnaireDashboard: async (): Promise<FonctionnaireDashboardStats> => {
    const response = await axiosInstance.get<FonctionnaireDashboardStats>(
      "/api/statistiques/fonctionnaire-dashboard",
    );
    return response.data;
  },

  getChefDashboard: async (): Promise<ChefDashboardStats> => {
    const response = await axiosInstance.get<ChefDashboardStats>(
      "/api/statistiques/chef-dashboard",
    );
    return response.data;
  },

  getSignataireDashboard: async (): Promise<SignataireDashboardStats> => {
    const response = await axiosInstance.get<SignataireDashboardStats>(
      "/api/statistiques/signataire-dashboard",
    );
    return response.data;
  },
};
