import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
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
import { statsApi } from "../../api/Statsapi";
import type { DashboardStatsResponse } from "../../types/Stats.types";

// ── Colour palette ─────────────────────────────────────────────────────────────
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

// ── Small stat card ────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  accent: string;
  sub?: string;
}

const StatCard = ({ label, value, accent, sub }: StatCardProps) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      borderLeft: `4px solid ${accent}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      height: "100%",
    }}
  >
    <Typography
      variant="body2"
      sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}
    >
      {label}
    </Typography>
    <Typography
      variant="h4"
      sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}
    >
      {value}
    </Typography>
    {sub && (
      <Typography
        variant="caption"
        sx={{ color: "#94a3b8", mt: 0.5, display: "block" }}
      >
        {sub}
      </Typography>
    )}
  </Paper>
);

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      height: "100%",
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 700,
        color: "#1e293b",
        mb: 2.5,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontSize: "0.75rem",
      }}
    >
      {title}
    </Typography>
    {children}
  </Paper>
);

// ── Main page ──────────────────────────────────────────────────────────────────
export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    statsApi
      .getDashboard()
      .then(setStats)
      .catch(() => setError("Impossible de charger les statistiques."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error ?? "Erreur inconnue."}</Alert>
      </Box>
    );
  }

  // ── Derived chart data ───────────────────────────────────────────────────────
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

  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Tableau de Bord Administratif
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Vue d'ensemble des demandes de congés — {currentYear}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ── KPI row ─────────────────────────────────────────────────────── */}
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

        {/* ── Taux row ────────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}
              >
                Taux de validation
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#10b981" }}
              >
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
              }}
            >
              <Typography sx={{ fontSize: "1.5rem" }}>✅</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}
              >
                Taux de rejet
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#ef4444" }}
              >
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
              }}
            >
              <Typography sx={{ fontSize: "1.5rem" }}>❌</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* ── Monthly bar chart ────────────────────────────────────────────── */}
        <Grid size={{ xs: 12 }}>
          <Section title={`Demandes par mois — ${currentYear}`}>
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
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "13px",
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
          </Section>
        </Grid>

        {/* ── Statut pie + type pie ────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Section title="Répartition par statut">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
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
                      fontSize: "13px",
                    }}
                    formatter={(val, name) => [val ?? 0, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: "12px", color: "#475569" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Section title="Type de congé">
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
                    fontSize: "13px",
                  }}
                  formatter={(val) => [val ?? 0, "demandes"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Section>
        </Grid>

        {/* ── Par direction bar chart ──────────────────────────────────────── */}
        {directionData.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Section title="Demandes par direction">
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
                      fontSize: "13px",
                    }}
                    formatter={(val) => [val ?? 0, "Demandes"]}
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
            </Section>
          </Grid>
        )}

        {/* ── Statut breakdown chips ───────────────────────────────────────── */}
        <Grid size={{ xs: 12 }}>
          <Section title="Détail par statut">
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
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
