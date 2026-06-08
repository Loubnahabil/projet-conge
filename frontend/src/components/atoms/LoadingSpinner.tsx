import { Box, CircularProgress } from "@mui/material";

interface LoadingSpinnerProps {
  minHeight?: string | number;
}

export const LoadingSpinner = ({ minHeight = "60vh" }: LoadingSpinnerProps) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight,
    }}
  >
    <CircularProgress />
  </Box>
);
