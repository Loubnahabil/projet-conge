import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { AppButton } from "@/components/atoms/AppButton";
import { JourFerieTable } from "@/components/organisms/JourFerieTable";
import { JourFerieFormModal } from "@/components/organisms/JourFerieFormModal";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchHolidays,
  createHoliday,
  updateHoliday,
} from "@/store/slices/jourFerieSlice";
import type { JourFerieResponse } from "@/types/jourFerie.types";
import { useTranslation } from "react-i18next";

export const JourFeriePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { globalLoading, error, actionLoading } = useSelector(
    (state: RootState) => state.jourFerie,
  );

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"create" | "edit">("create");
  const [editingHoliday, setEditingHoliday] = useState<JourFerieResponse | null>(null);

  useEffect(() => {
    dispatch(fetchHolidays());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setPopupMode("create");
    setEditingHoliday(null);
    setPopupOpen(true);
  };

  const handleOpenEdit = (item: JourFerieResponse) => {
    setPopupMode("edit");
    setEditingHoliday(item);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setEditingHoliday(null);
  };

  const handleSave = async (data: { date: string; libelle: string }) => {
    if (popupMode === "create") {
      await dispatch(createHoliday({ date: data.date, libelle: data.libelle }));
    } else if (editingHoliday) {
      await dispatch(
        updateHoliday({ id: editingHoliday.id, date: data.date, libelle: data.libelle }),
      );
    }
    handleClosePopup();
  };

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
        <AppButton text={t("jourFerie.addButton")} onClick={handleOpenCreate} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <JourFerieTable onEdit={handleOpenEdit} />

      <JourFerieFormModal
        isOpen={popupOpen}
        mode={popupMode}
        targetItem={editingHoliday}
        actionLoading={actionLoading}
        onClose={handleClosePopup}
        onSave={handleSave}
      />
    </Box>
  );
};

export default JourFeriePage;
