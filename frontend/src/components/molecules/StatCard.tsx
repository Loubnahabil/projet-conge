import { Paper, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
}

export const StatCard = ({ label, value, sub }: StatCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2.5,
      borderRadius: "8px",
      borderColor: "#e2e8f0",
      bgcolor: "#fff",
      height: "100%",
      boxShadow: "none",
    }}
  >
    <Typography
      variant="body2"
      sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}
    >
      {label}
    </Typography>
    <Typography
      variant="h5"
      sx={{ fontWeight: "700", color: "#0f172a", lineHeight: 1.2 }}
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
