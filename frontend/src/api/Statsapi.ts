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
      "/statistiques/dashboard",
    );
    return response.data;
  },

  getFonctionnaireDashboard: async (): Promise<FonctionnaireDashboardStats> => {
    const response = await axiosInstance.get<FonctionnaireDashboardStats>(
      "/statistiques/fonctionnaire-dashboard",
    );
    return response.data;
  },

  getChefDashboard: async (): Promise<ChefDashboardStats> => {
    const response = await axiosInstance.get<ChefDashboardStats>(
      "/statistiques/chef-dashboard",
    );
    return response.data;
  },

  getSignataireDashboard: async (): Promise<SignataireDashboardStats> => {
    const response = await axiosInstance.get<SignataireDashboardStats>(
      "/statistiques/signataire-dashboard",
    );
    return response.data;
  },
};
