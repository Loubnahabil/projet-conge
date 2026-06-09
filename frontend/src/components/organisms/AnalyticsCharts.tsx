import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box, Typography, Grid, Skeleton } from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardSection } from "@/components/molecules/DashboardSection";
import type { RootState } from "@/store";

const statusLabelMap: Record<string, string> = {
  BROUILLON: "status.brouillon",
  SOUMISE: "status.soumise",
  VISEE_CHEF: "status.viseeChef",
  SIGNEE_DIRECTEUR: "status.signeeDirecteur",
  REJETEE_CHEF: "status.rejeteeChef",
  REJETEE_DIRECTEUR: "status.rejeteeDirecteur",
  ANNULEE: "status.annulee",
};

const typeLabelMap: Record<string, string> = {
  ANNUEL: "leaveType.annuel",
  MALADIE: "leaveType.maladie",
};

export const AnalyticsCharts = () => {
  const { t } = useTranslation();
  const { data: stats, loading } = useSelector(
    (state: RootState) => state.stats,
  );

  if (loading || !stats) {
    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={260} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={260} />
        </Grid>
      </Grid>
    );
  }

  const directionData = (stats.parDirection || []).map((d) => ({
    name: d.directionNom,
    Demandes: d.nombreDemandes,
  }));

  const moisData = (stats.parMois || []).map((m) => ({
    name: m.moisLabel,
    Demandes: m.nombreDemandes,
  }));

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {/* Demandes par Direction */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardSection title={t("analytics.demandesParDirection")}>
          <Box sx={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart
                data={directionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="Demandes"
                  fill="#475569"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DashboardSection>
      </Grid>

      {/* Statistiques Mensuelles */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardSection title={t("analytics.statistiquesMensuelles")}>
          <Box sx={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart
                data={moisData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Demandes"
                  stroke="#475569"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </DashboardSection>
      </Grid>

      {/* Nombre de demandes par état */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardSection title={t("analytics.nombreDemandesParEtat")}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1.2, pt: 0.5 }}
          >
            {Object.entries(stats.parStatut || {}).map(([key, val]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px dashed #f1f5f9",
                  pb: 0.5,
                }}
              >
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  {t(statusLabelMap[key] ?? key)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "600", color: "#1e293b" }}
                >
                  {val}
                </Typography>
              </Box>
            ))}
          </Box>
        </DashboardSection>
      </Grid>

      {/* Demandes par Type de Congé */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DashboardSection title={t("analytics.demandesParType")}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1.2, pt: 0.5 }}
          >
            {Object.entries(stats.parTypeConge || {}).map(([key, val]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px dashed #f1f5f9",
                  pb: 0.5,
                }}
              >
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  {t(typeLabelMap[key] ?? key)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "600", color: "#1e293b" }}
                >
                  {val}
                </Typography>
              </Box>
            ))}
          </Box>
        </DashboardSection>
      </Grid>
    </Grid>
  );
};
