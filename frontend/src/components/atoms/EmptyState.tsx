import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  const { t } = useTranslation();
  const displayMessage = message ?? t("common.noData");
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: "italic" }}>
        {displayMessage}
      </Typography>
    </Box>
  );
};
