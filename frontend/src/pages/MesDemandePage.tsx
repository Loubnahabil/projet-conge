import React, { useState, useEffect, useCallback } from "react";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Button,
  Grid,
  Stack,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Edit,
  CloudUpload,
  Visibility,
  Cancel,
  Send,
  ArrowBack,
} from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AppButton } from "../components/atoms/AppButton";
import { FormInput } from "../components/molecules/FormInput";
import { demandeApi } from "../api/demandeApi";
import { demandeValidationSchema } from "../validations/demandeSchema";
import type {
  DemandeResponse,
  TypeConge,
  DemandeRequest,
} from "../types/Demande.types";
import type { UserResponseDTO } from "../types/user.types";

interface FormInputs {
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  interimId: string;
}

interface BackendErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const statutConfig: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  BROUILLON: { label: "Brouillon", color: "default" },
  SOUMISE: { label: "Soumise", color: "warning" },
  VISEE_CHEF: { label: "Visée par le Chef", color: "info" },
  SIGNEE_DIRECTEUR: { label: "Signée Directeur", color: "success" },
  REJETEE_CHEF: { label: "Rejetée Chef", color: "error" },
  REJETEE_DIRECTEUR: { label: "Rejetée Directeur", color: "error" },
  ANNULEE: { label: "Annulée", color: "default" },
};

const MOROCCAN_HOLIDAYS = [
  "2026-01-11",
  "2026-05-01",
  "2026-07-30",
  "2026-08-14",
  "2026-08-20",
  "2026-08-21",
  "2026-11-06",
  "2026-11-18",
];

export const MesDemandePage = () => {
  const [demandes, setDemandes] = useState<DemandeResponse[]>([]);
  const [colleagues, setColleagues] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isFormViewOpen, setIsFormViewOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(demandeValidationSchema),
    defaultValues: { typeConge: "", interimId: "", dateDebut: "", dateFin: "" },
  });

  const watchTypeConge = useWatch({ control, name: "typeConge" });
  const watchDateDebut = useWatch({ control, name: "dateDebut" });
  const watchDateFin = useWatch({ control, name: "dateFin" });

  let calculatedDuree = 0;
  if (watchDateDebut && watchDateFin) {
    const start = new Date(watchDateDebut);
    const end = new Date(watchDateFin);
    if (start <= end) {
      let days = 0;
      const current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        const dateStr = current.toISOString().split("T")[0];

        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = MOROCCAN_HOLIDAYS.includes(dateStr);

        if (!isWeekend && !isHoliday) {
          days++;
        }
        current.setDate(current.getDate() + 1);
      }
      calculatedDuree = days;
    }
  }

  const loadData = useCallback(async () => {
    try {
      const [myDemandes, users] = await Promise.all([
        demandeApi.getMyDemandes(),
        demandeApi.getSameServiceColleagues(),
      ]);
      setDemandes(myDemandes);
      setColleagues(users);
    } catch {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fixed: Resolved asynchronous lifecycle warning using a microtask timeout delay
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenCreateForm = () => {
    reset({ typeConge: "", interimId: "", dateDebut: "", dateFin: "" });
    setSelectedFile(null);
    setFileError(null);
    setEditingId(null);
    setError(null);
    setIsFormViewOpen(true);
  };

  const handleOpenEditForm = (d: DemandeResponse) => {
    setEditingId(d.id);
    setError(null);
    setFileError(null);
    setSelectedFile(null);
    setValue("typeConge", d.typeConge);
    setValue("dateDebut", d.dateDebut);
    setValue("dateFin", d.dateFin);
    setValue("interimId", d.interimId?.toString() || "");
    setIsFormViewOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFileError(null);
    }
  };

  const saveDemandeWorkflow = async (
    data: FormInputs,
    submitInstantly: boolean,
  ) => {
    if (data.typeConge === "MALADIE" && submitInstantly && !selectedFile) {
      setFileError(
        "Une pièce justificative (Certificat médical) est obligatoire pour soumettre un congé maladie.",
      );
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const payload: DemandeRequest = {
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        typeConge: data.typeConge as TypeConge,
        interimId: Number(data.interimId),
      };

      let activeDemandeId = editingId;

      if (editingId) {
        await demandeApi.create(payload, submitInstantly);
      } else {
        const createdDemande = await demandeApi.create(
          payload,
          submitInstantly,
        );
        if (createdDemande && createdDemande.id) {
          activeDemandeId = createdDemande.id;
        }
      }

      if (selectedFile && activeDemandeId) {
        await demandeApi.uploadDocument(
          activeDemandeId,
          selectedFile,
          "CERTIFICAT_MEDICAL",
        );
      }

      const updated = await demandeApi.getMyDemandes();
      setDemandes(updated);
      setIsFormViewOpen(false);
    } catch (err) {
      const errorWithResponse = err as BackendErrorResponse;
      setError(
        errorWithResponse.response?.data?.message ||
          "Erreur lors du traitement du congé.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectSubmitFromTable = async (id: number) => {
    setActionLoading(true);
    try {
      const fallbackPayload: DemandeRequest = {
        dateDebut: "",
        dateFin: "",
        typeConge: "ANNUEL" as TypeConge,
        interimId: id,
      };
      await demandeApi.create(fallbackPayload, true);
      setDemandes(await demandeApi.getMyDemandes());
    } catch {
      setError("Impossible de soumettre le document.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDemandeFromTable = (id: number) => {
    // 1. Store the ID of the row they clicked
    setSelectedDemandeId(id);
    // 2. Open the clean MUI Dialog
    setCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (selectedDemandeId === null) return;

    // Close the dialog immediately and show the loading spinner
    setCancelDialogOpen(false);
    setActionLoading(true);
    setError(null);

    try {
      await demandeApi.annulerDemande(selectedDemandeId);
      const updatedDemandes = await demandeApi.getMyDemandes();
      setDemandes(updatedDemandes);
    } catch (err) {
      const errorWithResponse = err as BackendErrorResponse;
      setError(
        errorWithResponse.response?.data?.message ||
          "Erreur lors de l'annulation de la demande.",
      );
    } finally {
      setActionLoading(false);
      setSelectedDemandeId(null); // Clear the tracking state
    }
  };

  if (loading) {
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
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {isFormViewOpen ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Fixed: Moved layout attributes into sx prop to pass strict types */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <IconButton onClick={() => setIsFormViewOpen(false)} size="small">
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
              {editingId
                ? `Modifier la Demande N° #${editingId}`
                : "Nouvelle Demande de Congé"}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mb: 3, pl: 5 }}
          >
            Saisissez vos dates d'absence. Les week-ends et jours fériés
            nationaux sont automatiquement exclus du décompte final.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date de la Demande"
                value={new Date().toLocaleDateString("fr-FR")}
                disabled
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Type de congé *"
                size="small"
                fullWidth
                defaultValue=""
                {...register("typeConge")}
                error={!!errors.typeConge}
                helperText={errors.typeConge?.message}
              >
                <MenuItem value="ANNUEL">Congé Annuel</MenuItem>
                <MenuItem value="MALADIE">Congé Maladie</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormInput
                label="Date de début *"
                type="date"
                registration={register("dateDebut")}
                error={!!errors.dateDebut}
                helperText={errors.dateDebut?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormInput
                label="Date de fin *"
                type="date"
                registration={register("dateFin")}
                error={!!errors.dateFin}
                helperText={errors.dateFin?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Durée calculée"
                value={`${calculatedDuree} jours`}
                size="small"
                disabled
                fullWidth
                slotProps={{ input: { style: { fontWeight: "bold" } } }} // Fixed: Swapped legacy InputProps for slotProps
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Intérimaire (Collègues du même service) *"
                size="small"
                fullWidth
                defaultValue=""
                {...register("interimId")}
                error={!!errors.interimId}
                helperText={errors.interimId?.message}
              >
                {colleagues.map((u) => (
                  <MenuItem key={u.id} value={u.id.toString()}>
                    {u.nom} {u.prenom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#475569", mb: 1 }}
              >
                Pièces Justificatives{" "}
                {watchTypeConge === "MALADIE" && (
                  <span style={{ color: "#ef4444" }}>*</span>
                )}
              </Typography>
              <Box
                sx={{
                  border: fileError
                    ? "2px dashed #ef4444"
                    : "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#f8fafc",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                />
                <CloudUpload sx={{ fontSize: 32, color: "#64748b", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  {selectedFile
                    ? `Fichier prêt : ${selectedFile.name}`
                    : "Sélectionner ou glisser un justificatif officiel (PDF, PNG, JPG)"}
                </Typography>
              </Box>
              {fileError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block" }}
                >
                  {fileError}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Fixed: Moved layout attributes into sx prop to pass strict types */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 5, justifyContent: "flex-end" }}
          >
            <AppButton
              text="Annuler"
              variant="outlined"
              onClick={() => setIsFormViewOpen(false)}
              disabled={actionLoading}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#64748b",
                "&:hover": { bgcolor: "#475569" },
                px: 3,
              }}
              onClick={handleSubmit((data) => saveDemandeWorkflow(data, false))}
              disabled={actionLoading}
            >
              Enregistrer Brouillon
            </Button>
            <AppButton
              text="Soumettre la Demande"
              onClick={handleSubmit((data) => saveDemandeWorkflow(data, true))}
              loading={actionLoading}
            />
          </Stack>
        </Paper>
      ) : (
        <>
          {/* Fixed: Moved layouts into sx style definitions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Mon Espace Congés (Fonctionnaire)
            </Typography>
            <AppButton
              text="+ Nouvelle Demande"
              onClick={handleOpenCreateForm}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            sx={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>N° Demande</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type de congé</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date début</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date fin</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Statut de la Demande
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demandes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 6, color: "#64748b" }}
                    >
                      Aucune demande enregistrée.
                    </TableCell>
                  </TableRow>
                ) : (
                  demandes.map((d) => {
                    const chip = statutConfig[d.statut] || {
                      label: d.statut,
                      color: "default",
                    };
                    const isBrouillon = d.statut === "BROUILLON";
                    const isSoumise = d.statut === "SOUMISE";

                    return (
                      <TableRow
                        key={d.id}
                        sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>#{d.id}</TableCell>
                        <TableCell>
                          {d.typeConge === "ANNUEL"
                            ? "🌴 Congé annuel"
                            : "🤒 Congé maladie"}
                        </TableCell>
                        <TableCell>{d.dateDebut}</TableCell>
                        <TableCell>{d.dateFin}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {d.duree} jours
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={chip.label}
                            color={chip.color}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            {isBrouillon && (
                              <>
                                <Tooltip title="Modifier">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenEditForm(d)}
                                    size="small"
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Soumettre">
                                  <IconButton
                                    sx={{ color: "#16a34a" }}
                                    onClick={() =>
                                      handleDirectSubmitFromTable(d.id)
                                    }
                                    size="small"
                                  >
                                    <Send fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            {isSoumise && (
                              <>
                                <Tooltip title="Voir">
                                  <IconButton
                                    color="info"
                                    onClick={() =>
                                      alert(`Consultation ID: ${d.id}`)
                                    }
                                    size="small"
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Annuler">
                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      handleCancelDemandeFromTable(d.id)
                                    }
                                    size="small"
                                  >
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            {!isBrouillon && !isSoumise && (
                              <Tooltip title="Voir">
                                <IconButton
                                  color="info"
                                  onClick={() =>
                                    alert(`Consultation ID: ${d.id}`)
                                  }
                                  size="small"
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Modern Dialog Popup Placed Perfectly Here */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: "12px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1e293b" }}>
          Annuler la demande de congé ?
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: "#475569" }}>
            Êtes-vous sûr de vouloir annuler cette demande ? Cette action mettra
            à jour le statut de votre dossier.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Retour
          </Button>

          <Button
            onClick={handleConfirmCancellation}
            color="error"
            variant="contained"
            autoFocus
            sx={{ fontWeight: 600, borderRadius: "6px" }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MesDemandePage;
