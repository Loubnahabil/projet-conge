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
  Grid, // MUI v6 standard Grid layout (Grid2)
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
  HistoryRecord,
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
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isFormViewOpen, setIsFormViewOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [selectedDemande, setSelectedDemande] =
    useState<DemandeResponse | null>(null);
  const [demandeHistory, setDemandeHistory] = useState<HistoryRecord[]>([]);

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
  const watchInterimId = useWatch({ control, name: "interimId" });

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
        if (!isWeekend && !isHoliday) days++;
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
      setError("Erreur lors du chargement des donnees.");
    } finally {
      setLoading(false);
    }
  }, []);

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
    setIsDetailViewOpen(false);
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
    setIsDetailViewOpen(false);
  };

  const handleOpenDetailView = async (d: DemandeResponse) => {
    setSelectedDemande(d);
    setDemandeHistory([]);
    setActionLoading(true);
    setIsDetailViewOpen(true);
    setIsFormViewOpen(false);
    try {
      const history = await demandeApi.getDemandeHistory(d.id);
      setDemandeHistory(history);
    } catch {
      setError("Impossible de charger l'historique de l'etat.");
    } finally {
      setActionLoading(false);
    }
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
        "Une piece justificative (Certificat medical) est obligatoire pour soumettre un conge maladie.",
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
        await demandeApi.update(editingId, payload);
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
          "Erreur lors du traitement du conge.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectSubmitFromTable = async (demande: DemandeResponse) => {
    setActionLoading(true);
    setError(null);
    try {
      if (!demande.interimId) {
        setError("Un intérimaire valide doit être désigné avant de soumettre.");
        return;
      }
      await demandeApi.soumettre(demande.id);
      setDemandes(await demandeApi.getMyDemandes());
    } catch {
      setError("Impossible de soumettre la demande.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDemandeFromTable = (id: number) => {
    setSelectedDemandeId(id);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (selectedDemandeId === null) return;
    setCancelDialogOpen(false);
    setActionLoading(true);
    setError(null);
    try {
      await demandeApi.annulerDemande(selectedDemandeId);
      const updatedDemandes = await demandeApi.getMyDemandes();
      setDemandes(updatedDemandes);
      if (isDetailViewOpen && selectedDemande?.id === selectedDemandeId) {
        setIsDetailViewOpen(false);
      }
    } catch (err) {
      const errorWithResponse = err as BackendErrorResponse;
      setError(
        errorWithResponse.response?.data?.message ||
          "Erreur lors de l'annulation de la demande.",
      );
    } finally {
      setActionLoading(false);
      setSelectedDemandeId(null);
    }
  };

  const getInterimName = (id?: number) => {
    if (!id) return "Aucun";
    const found = colleagues.find((c) => c.id === id);
    return found ? `${found.nom} ${found.prenom}` : `ID: ${id}`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return (
      d.toLocaleDateString("fr-MA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {/* 1. FORM VIEW */}
      {isFormViewOpen && !isDetailViewOpen && (
        <Paper
          sx={{
            p: 4,
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
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
                ? `Modifier la Demande N #${editingId}`
                : "Nouvelle Demande de Conge"}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mb: 3, pl: 5 }}
          >
            Saisissez vos dates d'absence. Les week-ends et jours feries
            nationaux sont automatiquement exclus du decompte final.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* ✅ Fixed for MUI v6 container declaration */}
          <Grid container spacing={3}>
            {/* ✅ Fixed size structure for sub items */}
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
                label="Type de conge *"
                size="small"
                fullWidth
                value={watchTypeConge || ""} // 🟢 ADD THIS LINE
                {...register("typeConge")}
                error={!!errors.typeConge}
                helperText={errors.typeConge?.message}
              >
                <MenuItem value="ANNUEL">Conge Annuel</MenuItem>
                <MenuItem value="MALADIE">Conge Maladie</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormInput
                label="Date de debut *"
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
                label="Duree calculee"
                value={`${calculatedDuree} jours`}
                size="small"
                disabled
                fullWidth
                slotProps={{ input: { style: { fontWeight: "bold" } } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Interimaire (Collegues du meme service) *"
                size="small"
                fullWidth
                value={watchInterimId || ""} // 🟢 ADD THIS LINE
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
                Pieces Justificatives{" "}
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
                    ? `Fichier pret : ${selectedFile.name}`
                    : "Selectionner ou glisser un justificatif officiel (PDF, PNG, JPG)"}
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
      )}

      {/* 2. DETAIL VIEW */}
      {!isFormViewOpen && isDetailViewOpen && selectedDemande && (
        <Paper
          sx={{
            p: 4,
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 25px rgba(0,0,0,0.04)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <IconButton
                onClick={() => setIsDetailViewOpen(false)}
                size="small"
                sx={{ border: "1px solid #cbd5e1" }}
              >
                <ArrowBack fontSize="small" />
              </IconButton>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "#0f172a" }}
                >
                  DEM-2026-00{selectedDemande.id} —{" "}
                  {selectedDemande.typeConge === "ANNUEL"
                    ? "Conge annuel"
                    : "Conge maladie"}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 0.5, alignItems: "center" }}
                >
                  <Chip
                    label={
                      statutConfig[selectedDemande.statut]?.label ||
                      selectedDemande.statut
                    }
                    color={
                      statutConfig[selectedDemande.statut]?.color || "default"
                    }
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    En attente de traitement par le circuit administratif
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {(selectedDemande.statut === "BROUILLON" ||
              selectedDemande.statut === "SOUMISE") && (
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Cancel />}
                onClick={() => handleCancelDemandeFromTable(selectedDemande.id)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              >
                Annuler la demande
              </Button>
            )}
          </Box>

          {/* ✅ Fixed for MUI v6 container declaration */}
          <Grid container spacing={4}>
            {/* Left: Info */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: "12px", bgcolor: "#f8fafc" }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
                >
                  INFORMATIONS DOSSIER
                </Typography>
                <Stack spacing={2}>
                  {[
                    {
                      label: "Type de conge",
                      value:
                        selectedDemande.typeConge === "ANNUEL"
                          ? "Conge Annuel"
                          : "Conge Maladie",
                    },
                    {
                      label: "Date de depart",
                      value: selectedDemande.dateDebut,
                    },
                    { label: "Date de retour", value: selectedDemande.dateFin },
                    {
                      label: "Duree accordee",
                      value: `${selectedDemande.duree} jours ouvrables`,
                      bold: true,
                    },
                    { label: "Annee administrative", value: "2026" },
                    {
                      label: "Interim designe",
                      value: getInterimName(selectedDemande.interimId),
                      blue: true,
                    },
                  ].map((row, i, arr) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom:
                          i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
                        pb: i < arr.length - 1 ? 1 : 0,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: row.bold ? 700 : 600,
                          color: row.blue ? "#2563eb" : "#0f172a",
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Right: History Timeline */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: "12px", minHeight: "100%" }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}
                >
                  HISTORIQUE DES ETATS
                </Typography>

                {actionLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : demandeHistory.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Aucun historique de suivi enregistre.
                  </Typography>
                ) : (
                  <Stack
                    spacing={3}
                    sx={{
                      position: "relative",
                      pl: 2,
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: "4px",
                        top: "8px",
                        bottom: "8px",
                        width: "2px",
                        bgcolor: "#e2e8f0",
                      },
                    }}
                  >
                    {demandeHistory.map((log, index) => (
                      <Box key={log.id} sx={{ position: "relative" }}>
                        <Box
                          sx={{
                            position: "absolute",
                            left: "-16px",
                            top: "4px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            bgcolor: index === 0 ? "#2563eb" : "#cbd5e1",
                            border: index === 0 ? "2px solid #93c5fd" : "none",
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{
                            display: "block",
                            fontWeight: 500,
                            fontFamily: "monospace",
                          }}
                        >
                          {formatDate(log.dateAction)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: index === 0 ? "#0f172a" : "#475569",
                            mt: 0.2,
                          }}
                        >
                          {statutConfig[log.statutAction]?.label ||
                            log.statutAction}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* 3. DEFAULT LIST VIEW TABLE */}
      {!isFormViewOpen && !isDetailViewOpen && (
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Mes Demandes de Congé
            </Typography>
            <Button variant="contained" onClick={handleOpenCreateForm}>
              Nouvelle Demande
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Début</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fin</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>
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
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      Aucune demande trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  demandes.map((d) => {
                    const isBrouillon = d.statut === "BROUILLON";
                    const isSoumise = d.statut === "SOUMISE";
                    const canEdit = isBrouillon || isSoumise;

                    return (
                      <TableRow key={d.id} hover>
                        <TableCell>#{d.id}</TableCell>
                        <TableCell>
                          {d.typeConge === "ANNUEL" ? "Annuel" : "Maladie"}
                        </TableCell>
                        <TableCell>{d.dateDebut}</TableCell>
                        <TableCell>{d.dateFin}</TableCell>
                        <TableCell>{d.duree} j</TableCell>
                        <TableCell>
                          <Chip
                            label={statutConfig[d.statut]?.label || d.statut}
                            color={statutConfig[d.statut]?.color || "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 2 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ justifyContent: "flex-end" }} // ✅ Fixed for MUI v6
                          >
                            <Tooltip title="Voir Détails">
                              <IconButton
                                color="info"
                                onClick={() => handleOpenDetailView(d)}
                                size="small"
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {canEdit && (
                              <Tooltip title="Modifier">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenEditForm(d)}
                                  size="small"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {isBrouillon && (
                              <>
                                <Tooltip title="Soumettre">
                                  <IconButton
                                    sx={{ color: "#16a34a" }}
                                    onClick={() =>
                                      handleDirectSubmitFromTable(d)
                                    }
                                    size="small"
                                  >
                                    <Send fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Annuler (Supprimer)">
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

                            {isSoumise && (
                              <Tooltip title="Annuler la demande">
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
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Confirmation Dialog for Cancellations */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler ou supprimer cette demande de congé
            administrative ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            Ignorer
          </Button>
          <Button
            onClick={handleConfirmCancellation}
            color="error"
            autoFocus
            variant="contained"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
