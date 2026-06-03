import { useSelector } from "react-redux";
import { Box, Paper, Typography, Grid, Skeleton } from "@mui/material";
import { StatCard } from "../molecules/StatCard";
import type { RootState } from "../../store";

export const PerformanceOverview = () => {
  const { data: stats, loading } = useSelector(
    (state: RootState) => state.stats,
  );

  // Show skeletons while loading so the layout doesn't jump
  if (loading || !stats) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton
              variant="rounded"
              height={108}
              sx={{ borderRadius: "14px" }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* KPI Counters */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="Total demandes"
          value={stats.totalDemandes}
          accent="#3b82f6"
          sub="Toutes périodes confondues"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="Fonctionnaires"
          value={stats.totalFonctionnaires}
          accent="#6366f1"
          sub="Comptes actifs et inactifs"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="En attente de visa"
          value={stats.enAttenteVisa}
          accent="#f59e0b"
          sub="Statut SOUMISE"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="En attente de signature"
          value={stats.enAttenteSignature}
          accent="#10b981"
          sub="Statut VISÉE CHEF"
        />
      </Grid>

      {/* Ratios */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}
            >
              Taux de validation
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#10b981" }}>
              {stats.tauxValidation}%
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Sur les demandes traitées définitivement
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ✅
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}
            >
              Taux de rejet
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#ef4444" }}>
              {stats.tauxRejet}%
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Sur les demandes traitées définitivement
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ❌
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
