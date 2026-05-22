import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import * as yup from "yup";
import type { QuotaResponseDTO } from "../../api/quotaApi";
import { quotaApi } from "../../api/quotaApi";
import { axiosInstance } from "../../api/axiosInstance";

const quotaValidationSchema = yup.object().shape({
  joursAlloues: yup
    .number()
    .required("Obligatoire")
    .min(0, "Ne peut pas être négatif")
    .max(90, "Ne peut pas dépasser 90 jours"),
  joursUtilises: yup
    .number()
    .required("Obligatoire")
    .min(0, "Ne peut pas être négatif"),
});

interface ExtendedQuota extends QuotaResponseDTO {
  grade?: string;
}

export default function QuotaManagementPage() {
  const currentYearNum = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [quotas, setQuotas] = useState<ExtendedQuota[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: number]: string;
  }>({});

  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editAlloues, setEditAlloues] = useState<number>(30);
  const [editUtilises, setEditUtilises] = useState<number>(0);

  const yearsList = [currentYearNum - 1, currentYearNum, currentYearNum + 1];

  const loadQuotasMatrix = async () => {
    try {
      const usersResponse = await axiosInstance.get("/api/users");
      const workers = usersResponse.data.content || usersResponse.data;

      const compiledData: ExtendedQuota[] = [];

      for (const user of workers) {
        try {
          const qData = await quotaApi.getQuotaByUserAndYear(
            user.id,
            selectedYear,
          );
          compiledData.push({
            ...qData,
            grade: user.grade || "Non spécifié",
          });
        } catch {
          compiledData.push({
            id: -user.id,
            userId: user.id,
            userNomComplet: `${user.prenom} ${user.nom}`,
            annee: selectedYear,
            joursAlloues: 30,
            joursUtilises: 0,
            joursRestants: 30,
            grade: user.grade || "Non spécifié",
          });
        }
      }
      setQuotas(compiledData);
    } catch {
      setFeedback({
        type: "error",
        text: "Erreur lors de la récupération des données.",
      });
    }
  };

  useEffect(() => {
    loadQuotasMatrix();
    setEditingRowId(null);
  }, [selectedYear]);

  const startEditingRow = (row: ExtendedQuota) => {
    if (row.id < 0) {
      setFeedback({
        type: "error",
        text: "Le quota de cet utilisateur n'est pas encore initialisé en BDD.",
      });
      return;
    }
    setEditingRowId(row.id);
    setEditAlloues(row.joursAlloues);
    setEditUtilises(row.joursUtilises);
    setValidationErrors((prev) => ({ ...prev, [row.id]: "" }));
  };

  const handleSaveInline = async (id: number) => {
    try {
      await quotaValidationSchema.validate({
        joursAlloues: editAlloues,
        joursUtilises: editUtilises,
      });

      const updatedQuota = await quotaApi.updateQuota(id, {
        joursAlloues: editAlloues,
        joursUtilises: editUtilises,
      });

      setFeedback({ type: "success", text: "Quota mis à jour avec succès." });
      setEditingRowId(null);

      setQuotas((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updatedQuota } : q)),
      );
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        setValidationErrors((prev) => ({ ...prev, [id]: err.message }));
      } else {
        setFeedback({
          type: "error",
          text: "Échec de l'enregistrement de la modification.",
        });
      }
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          Gestion des Quotas Annuels
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="year-select-label">Année</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            label="Année"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ borderRadius: "20px", backgroundColor: "#fff" }}
          >
            {yearsList.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {feedback && (
        <Alert
          severity={feedback.type}
          sx={{ mb: 3 }}
          onClose={() => setFeedback(null)}
        >
          {feedback.text}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Nom Complet</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "180px" }}>
                Alloués
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "180px" }}>
                Utilisés
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Restants</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "120px" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotas.map((row) => {
              const isEditing = editingRowId === row.id;
              const hasError = validationErrors[row.id];

              return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.userNomComplet}
                  </TableCell>
                  <TableCell>{row.grade}</TableCell>

                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editAlloues}
                        error={!!hasError}
                        helperText={hasError}
                        slotProps={{ htmlInput: { min: 0, max: 90 } }}
                        onChange={(e) =>
                          setEditAlloues(parseInt(e.target.value) || 0)
                        }
                      />
                    ) : (
                      <strong>{row.joursAlloues} jrs</strong>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editUtilises}
                        slotProps={{ htmlInput: { min: 0 } }}
                        onChange={(e) =>
                          setEditUtilises(parseInt(e.target.value) || 0)
                        }
                      />
                    ) : (
                      <span style={{ color: "#d32f2f" }}>
                        {row.joursUtilises} jrs
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "#2e7d32", pt: 1 }}
                      >
                        {editAlloues - editUtilises} jrs (calculé)
                      </Typography>
                    ) : (
                      <Typography sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                        {row.joursRestants} jrs
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          color="success"
                          onClick={() => handleSaveInline(row.id)}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => setEditingRowId(null)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton
                        color="primary"
                        onClick={() => startEditingRow(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
