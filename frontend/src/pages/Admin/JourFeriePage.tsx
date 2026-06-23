import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { AppButton } from "@/components/atoms/AppButton";
import { JourFerieTable } from "@/components/organisms/JourFerieTable";
import { JourFerieFormModal } from "@/components/organisms/JourFerieFormModal";
import type { RootState, AppDispatch } from "@/store";
import { createHoliday, updateHoliday } from "@/store/slices/jourFerieSlice";
import type { JourFerieResponse } from "@/types/jourFerie.types";
import { useTranslation } from "react-i18next";

export const JourFeriePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { error, actionLoading } = useSelector((state: RootState) => state.jourFerie);

  const [view, setView] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<JourFerieResponse | null>(null);

  const openCreate = () => {
    setView("create");
    setEditing(null);
  };
  const openEdit = (item: JourFerieResponse) => {
    setView("edit");
    setEditing(item);
  };
  const close = () => setView("closed");

  const handleSave = async (data: { date: string; libelle: string }) => {
    if (view === "create") {
      await dispatch(createHoliday({ date: data.date, libelle: data.libelle }));
    } else if (editing) {
      await dispatch(updateHoliday({ id: editing.id, date: data.date, libelle: data.libelle }));
    }
    close();
  };

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
        <AppButton text={t("jourFerie.addButton")} onClick={openCreate} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <JourFerieTable onEdit={openEdit} />

      <JourFerieFormModal
        isOpen={view !== "closed"}
        mode={view === "edit" ? "edit" : "create"}
        targetItem={editing}
        actionLoading={actionLoading}
        onClose={close}
        onSave={handleSave}
      />
    </Box>
  );
};

export default JourFeriePage;
