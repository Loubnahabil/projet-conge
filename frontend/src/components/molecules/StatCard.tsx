import { Paper, Typography, Box } from "@mui/material";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}

export const StatCard = ({ label, value, sub, color = "#3b82f6" }: StatCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2.5,
      borderRadius: "10px",
      borderColor: "#e2e8f0",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
      "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
    }}
  >
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", bgcolor: color }} />
    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: "700", color: "#0f172a", lineHeight: 1.2 }}>
      {value}
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.5, display: "block" }}>
        {sub}
      </Typography>
    )}
  </Paper>
);
