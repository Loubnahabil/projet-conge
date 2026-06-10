import { Paper, Typography, Divider } from "@mui/material";

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardSection = ({
  title,
  children,
}: DashboardSectionProps) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      height: "100%",
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 700,
        color: "#0f172a",
        mb: 1.5,
        fontSize: "0.85rem",
      }}
    >
      {title}
    </Typography>
    <Divider sx={{ mb: 2, borderColor: "#f1f5f9" }} />
    {children}
  </Paper>
);
