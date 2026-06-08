import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { PerformanceOverview } from "@/components/organisms/PerformanceOverview";
import { AnalyticsCharts } from "@/components/organisms/AnalyticsCharts";
import { fetchDashboardStatsThunk } from "@/store/slices/statsSlice";
import type { RootState, AppDispatch } from "@/store";

export const AdminDashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchDashboardStatsThunk());
  }, [dispatch]);

  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Structural Layout Title Block[cite: 10] */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Tableau de Bord Administratif
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Vue d'ensemble des demandes de congés — {currentYear}
        </Typography>
      </Box>

      {/* Global Error Banner */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* 🚀 Smart Organism 1: Numbers, counters and rates */}
      <PerformanceOverview />

      {/* 🚀 Smart Organism 2: High-level analytics graphs */}
      <AnalyticsCharts />
    </Box>
  );
};

export default AdminDashboardPage;
