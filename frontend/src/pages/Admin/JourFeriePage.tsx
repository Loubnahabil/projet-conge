import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { AppButton } from "@/components/atoms/AppButton";
import { JourFerieTable } from "@/components/organisms/JourFerieTable";
import { JourFerieFormModal } from "@/components/organisms/JourFerieFormModal";
import type { RootState, AppDispatch } from "@/store";
import { fetchHolidaysThunk, openHolidayPopup } from "@/store/slices/jourFerieSlice";
import { useTranslation } from "react-i18next";

export const JourFeriePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { globalLoading, error } = useSelector((state: RootState) => state.jourFerie);

  useEffect(() => {
    dispatch(fetchHolidaysThunk());
  }, [dispatch]);

  if (globalLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, minHeight: "100vh", bgcolor: "transparent" }}>
      {/* Upper Header Layout */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "700", color: "#1e293b" }}>
          {t("jourFerie.title")}
        </Typography>
        <AppButton
          text={t("jourFerie.addButton")}
          onClick={() => dispatch(openHolidayPopup({ mode: "create" }))}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 🧬 Grid Collection Organism */}
      <JourFerieTable />

      {/* 🧬 Input Modal Popover Form Organism */}
      <JourFerieFormModal />
    </Box>
  );
};

export default JourFeriePage;
