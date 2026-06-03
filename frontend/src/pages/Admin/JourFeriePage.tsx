import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { AppButton } from "../../components/atoms/AppButton";
import { JourFerieTable } from "../../components/organisms/JourFerieTable";
import { JourFerieFormModal } from "../../components/organisms/JourFerieFormModal";
import type { RootState, AppDispatch } from "../../store";
import {
  fetchHolidaysThunk,
  openHolidayPopup,
} from "../../store/slices/jourFerieSlice";

export const JourFeriePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { globalLoading, error } = useSelector(
    (state: RootState) => state.jourFerie,
  );

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
        <CircularProgress />
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
          Gestion des Jours Fériés
        </Typography>
        <AppButton
          text="+ Ajouter un jour férié"
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
