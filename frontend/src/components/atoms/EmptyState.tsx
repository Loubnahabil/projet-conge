import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message = "Aucune donnée trouvée." }: EmptyStateProps) => (
  <Box sx={{ textAlign: "center", py: 4 }}>
    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: "italic" }}>
      {message}
    </Typography>
  </Box>
);
