import { useSelector } from "react-redux";
import { Box, Chip, Typography, Grid, Skeleton } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DashboardSection } from "../molecules/DashboardSection";
import type { RootState } from "../../store";

const STATUT_COLORS: Record<string, string> = {
  BROUILLON: "#94a3b8",
  SOUMISE: "#f59e0b",
  VISEE_CHEF: "#3b82f6",
  SIGNEE_DIRECTEUR: "#10b981",
  REJETEE_CHEF: "#ef4444",
  REJETEE_DIRECTEUR: "#dc2626",
  ANNULEE: "#6b7280",
};
const STATUT_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  SOUMISE: "Soumise",
  VISEE_CHEF: "Visée chef",
  SIGNEE_DIRECTEUR: "Signée",
  REJETEE_CHEF: "Rejetée chef",
  REJETEE_DIRECTEUR: "Rejetée direction",
  ANNULEE: "Annulée",
};
const TYPE_COLORS = ["#3b82f6", "#f59e0b"];
const DIRECTION_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export const AnalyticsCharts = () => {
  const { data: stats, loading } = useSelector(
    (state: RootState) => state.stats,
  );

  if (loading || !stats) {
    return (
      <Box sx={{ mt: 3 }}>
        <Skeleton
          variant="rounded"
          height={300}
          sx={{ borderRadius: "14px", mb: 3 }}
        />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton
              variant="rounded"
              height={240}
              sx={{ borderRadius: "14px" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton
              variant="rounded"
              height={240}
              sx={{ borderRadius: "14px" }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Derived Calculations[cite: 10]
  const currentYear = new Date().getFullYear();
  const statutPieData = Object.entries(stats.parStatut).map(([key, val]) => ({
    name: STATUT_LABELS[key] ?? key,
    value: val,
    color: STATUT_COLORS[key] ?? "#94a3b8",
  }));
  const typeCongeData = Object.entries(stats.parTypeConge).map(
    ([key, val]) => ({
      name: key === "ANNUEL" ? "Congé Annuel" : "Congé Maladie",
      value: val,
    }),
  );
  const directionData = stats.parDirection.map((d) => ({
    name:
      d.directionNom.length > 18
        ? d.directionNom.slice(0, 16) + "…"
        : d.directionNom,
    fullName: d.directionNom,
    demandes: d.nombreDemandes,
  }));
  const moisData = stats.parMois.map((m) => ({
    name: m.moisLabel,
    demandes: m.nombreDemandes,
  }));

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Monthly chart[cite: 10] */}
      <Grid size={{ xs: 12 }}>
        <DashboardSection title={`Demandes par mois — ${currentYear}`}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={moisData}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
                formatter={(val) => [val ?? 0, "Demandes"]}
              />
              <Bar
                dataKey="demandes"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardSection>
      </Grid>

      {/* Status & Type Pies[cite: 10] */}
      <Grid size={{ xs: 12, md: 7 }}>
        <DashboardSection title="Répartition par statut">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statutPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {statutPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => (
                  <span style={{ fontSize: "12px", color: "#475569" }}>
                    {val}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </DashboardSection>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <DashboardSection title="Type de congé">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeCongeData}
                cx="50%"
                cy="50%"
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {typeCongeData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </DashboardSection>
      </Grid>

      {/* Direction Bar Chart[cite: 10] */}
      {directionData.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <DashboardSection title="Demandes par direction">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={directionData}
                layout="vertical"
                margin={{ top: 4, right: 32, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? ""
                  }
                />
                <Bar dataKey="demandes" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {directionData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={DIRECTION_COLORS[index % DIRECTION_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DashboardSection>
        </Grid>
      )}

      {/* Detail Breakdown Chips[cite: 10] */}
      <Grid size={{ xs: 12 }}>
        <DashboardSection title="Détail par statut">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {Object.entries(stats.parStatut).map(([key, val]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  px: 2,
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: STATUT_COLORS[key] ?? "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#475569", fontWeight: 500 }}
                >
                  {STATUT_LABELS[key] ?? key}
                </Typography>
                <Chip
                  label={val}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    bgcolor: STATUT_COLORS[key] ?? "#94a3b8",
                    color: "#fff",
                  }}
                />
              </Box>
            ))}
          </Box>
        </DashboardSection>
      </Grid>
    </Grid>
  );
};
