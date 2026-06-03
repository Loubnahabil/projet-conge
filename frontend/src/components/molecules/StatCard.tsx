import { Paper, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: number | string;
  accent: string;
  sub?: string;
}

export const StatCard = ({ label, value, accent, sub }: StatCardProps) => (
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
