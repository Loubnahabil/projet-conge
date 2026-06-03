import { Paper, Typography } from "@mui/material";

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
