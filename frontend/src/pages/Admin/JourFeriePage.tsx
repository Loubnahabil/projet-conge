import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit, Delete, EventNote } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { FormInput } from "../../components/molecules/FormInput";
import { AppButton } from "../../components/atoms/AppButton";
import { jourFerieApi } from "../../api/jourFerieApi";
import type { JourFerieResponseDTO } from "../../types/jourFerie.types";

interface FormInputs {
  date: string;
  libelle: string;
}

interface PopupState {
  isOpen: boolean;
  mode: "create" | "edit";
  targetId?: number | null;
}

export const JourFeriePage = () => {
  const [holidays, setHolidays] = useState<JourFerieResponseDTO[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    mode: "create",
    targetId: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>();

  const loadHolidaysList = useCallback(async () => {
    try {
      setError(null);
      const data = await jourFerieApi.getAll();
      setHolidays(data || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les jours fériés depuis le serveur.");
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const executeLoadingTask = async () => {
      if (isMounted) {
        await loadHolidaysList();
      }
    };

    executeLoadingTask();

    return () => {
      isMounted = false; // Safety guard to clear state tracking if user leaves the page quickly
    };
  }, [loadHolidaysList]);

  const openPopup = (mode: "create" | "edit", item?: JourFerieResponseDTO) => {
    reset();
    if (mode === "edit" && item) {
      setValue("date", item.date);
      setValue("libelle", item.libelle);
      setPopup({ isOpen: true, mode: "edit", targetId: item.id });
    } else {
      setPopup({ isOpen: true, mode: "create", targetId: null });
    }
  };

  const closePopup = () => {
    setPopup({ isOpen: false, mode: "create", targetId: null });
    reset();
  };

  const onSave = async (data: FormInputs) => {
    setActionLoading(true);
    try {
      if (popup.mode === "create") {
        await jourFerieApi.create(data.date, data.libelle);
      } else if (popup.mode === "edit" && popup.targetId) {
        await jourFerieApi.update(popup.targetId, data.date, data.libelle);
      }
      await loadHolidaysList();
      closePopup();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du jour férié.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce jour férié ?"))
      return;
    try {
      await jourFerieApi.delete(id);
      await loadHolidaysList();
    } catch (err) {
      console.error(err);
      alert("Échec de la suppression.");
    }
  };

  // Helper helper to turn YYYY-MM-DD into DD/MM/YYYY readable layout
  const formatDateString = (rawDate: string) => {
    if (!rawDate) return "";
    const [year, month, day] = rawDate.split("-");
    return `${day}/${month}/${year}`;
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, minHeight: "100vh", bgcolor: "transparent" }}>
      {/* Top Section */}
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
          onClick={() => openPopup("create")}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Clean Light Table Structure */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Désignation / Libellé
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "600", color: "#475569", pr: 4 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 6, color: "#64748b" }}
                >
                  <EventNote
                    sx={{ fontSize: "2.5rem", mb: 1, color: "#94a3b8" }}
                  />
                  <Typography variant="body2">
                    Aucun jour férié enregistré pour le moment.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
                >
                  <TableCell sx={{ fontWeight: "500", color: "#1e293b" }}>
                    {formatDateString(item.date)}
                  </TableCell>
                  <TableCell sx={{ color: "#334155" }}>
                    {item.libelle}
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => openPopup("edit", item)}
                      sx={{ color: "#1976d2", mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      sx={{ color: "#d32f2f" }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Input Modal Form */}
      <Dialog
        open={popup.isOpen}
        onClose={closePopup}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#fff",
              color: "#333",
              width: "400px",
              borderRadius: "12px",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#1e293b" }}
        >
          {popup.mode === "create"
            ? "Ajouter un jour férié"
            : "Modifier le jour férié"}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSave)}
            noValidate
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormInput
              label=""
              type="date"
              registration={register("date", {
                required: "La date est obligatoire",
              })}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
            <FormInput
              label="Libellé du jour férié"
              registration={register("libelle", {
                required: "Ce champ est obligatoire",
              })}
              error={!!errors.libelle}
              helperText={errors.libelle?.message}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <AppButton
            text="Annuler"
            variant="outlined"
            onClick={closePopup}
            disabled={actionLoading}
          />
          <AppButton
            text="Enregistrer"
            onClick={handleSubmit(onSave)}
            loading={actionLoading}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JourFeriePage;
