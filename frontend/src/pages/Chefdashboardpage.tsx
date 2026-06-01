import { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { AppButton } from "../components/atoms/AppButton";
import { demandeApi } from "../api/demandeApi";
import type { DemandeResponse } from "../types/Demande.types";

const statutLabel: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "info" | "default" }
> = {
  VISEE_CHEF: { label: "Visée", color: "success" },
  REJETEE_CHEF: { label: "Rejetée", color: "error" },
  SIGNEE_DIRECTEUR: { label: "Signée directeur", color: "info" },
  REJETEE_DIRECTEUR: { label: "Rejetée direction", color: "error" },
};

export const ChefDashboardPage = () => {
  const [tab, setTab] = useState(0);

  // Tab 0 — pending
  const [demandes, setDemandes] = useState<DemandeResponse[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Tab 1 — treated
  const [traitees, setTraitees] = useState<DemandeResponse[]>([]);
  const [loadingTraitees, setLoadingTraitees] = useState(false);
  const [traiteesFetched, setTraiteesFetched] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "approve" | "reject" | null;
    targetId: number | null;
  }>({ open: false, mode: null, targetId: null });
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    demandeApi
      .getDemandesAViser()
      .then(setDemandes)
      .catch(() => setError("Erreur lors du chargement des demandes à viser."))
      .finally(() => setLoadingPending(false));
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    // lazy-load treated demandes only once
    if (newValue === 1 && !traiteesFetched) {
      setLoadingTraitees(true);
      demandeApi
        .getDemandesTraiteesChef()
        .then(setTraitees)
        .catch(() =>
          setError("Erreur lors du chargement des demandes traitées."),
        )
        .finally(() => {
          setLoadingTraitees(false);
          setTraiteesFetched(true);
        });
    }
  };

  const pendingDemandes = demandes.filter((d) => d.statut === "SOUMISE");

  const openDialog = (mode: "approve" | "reject", id: number) => {
    setCommentaire("");
    setError(null);
    setDialog({ open: true, mode, targetId: id });
  };

  const handleConfirm = async () => {
    if (!dialog.targetId || !dialog.mode) return;
    if (dialog.mode === "reject" && !commentaire.trim()) {
      setError("Un commentaire est obligatoire en cas de rejet.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await demandeApi.visaChef(dialog.targetId, dialog.mode === "approve", {
        commentaire: commentaire || undefined,
      });
      const updated = await demandeApi.getDemandesAViser();
      setDemandes(updated);
      // invalidate treated cache so it reloads next time the tab is opened
      setTraiteesFetched(false);
      setDialog({ open: false, mode: null, targetId: null });
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { error?: string; message?: string } };
      };
      setError(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Erreur lors du traitement.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingPending) {
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
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}
      >
        Tableau de bord — Chef hiérarchique
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: "1px solid #e2e8f0" }}
      >
        <Tab label={`À viser (${pendingDemandes.length})`} />
        <Tab label="Demandes traitées" />
      </Tabs>

      {/* ── Tab 0: Pending ── */}
      {tab === 0 && (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {[
                  "Fonctionnaire",
                  "Service",
                  "Type",
                  "Date début",
                  "Date fin",
                  "Durée (j)",
                  "Intérimaire",
                  "Actions",
                ].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 7 ? "right" : "left"}
                    sx={{
                      fontWeight: 600,
                      color: "#475569",
                      ...(i === 7 && { pr: 4 }),
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingDemandes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 6, color: "#64748b" }}
                  >
                    Aucune demande en attente.
                  </TableCell>
                </TableRow>
              ) : (
                pendingDemandes.map((d) => (
                  <TableRow
                    key={d.id}
                    sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {d.userNomComplet}
                    </TableCell>
                    <TableCell sx={{ color: "#475569" }}>
                      {d.userServiceNom}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={d.typeConge === "ANNUEL" ? "Annuel" : "Maladie"}
                        size="small"
                        color={d.typeConge === "ANNUEL" ? "primary" : "warning"}
                      />
                    </TableCell>
                    <TableCell>{d.dateDebut}</TableCell>
                    <TableCell>{d.dateFin}</TableCell>
                    <TableCell>{d.duree}</TableCell>
                    <TableCell>{d.interimNomComplet || "Aucun"}</TableCell>
                    <TableCell align="right" sx={{ pr: 2 }}>
                      <Tooltip title="Approuver">
                        <IconButton
                          size="small"
                          sx={{ color: "#16a34a", mr: 1 }}
                          onClick={() => openDialog("approve", d.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeter">
                        <IconButton
                          size="small"
                          sx={{ color: "#d32f2f" }}
                          onClick={() => openDialog("reject", d.id)}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Tab 1: Treated ── */}
      {tab === 1 &&
        (loadingTraitees ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  {[
                    "Fonctionnaire",
                    "Service",
                    "Type",
                    "Date début",
                    "Date fin",
                    "Durée (j)",
                    "Statut",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{ fontWeight: 600, color: "#475569" }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {traitees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 6, color: "#64748b" }}
                    >
                      Aucune demande traitée pour l'instant.
                    </TableCell>
                  </TableRow>
                ) : (
                  traitees.map((d) => {
                    const s = statutLabel[d.statut] ?? {
                      label: d.statut,
                      color: "default" as const,
                    };
                    return (
                      <TableRow
                        key={d.id}
                        sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {d.userNomComplet}
                        </TableCell>
                        <TableCell sx={{ color: "#475569" }}>
                          {d.userServiceNom}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              d.typeConge === "ANNUEL" ? "Annuel" : "Maladie"
                            }
                            size="small"
                            color={
                              d.typeConge === "ANNUEL" ? "primary" : "warning"
                            }
                          />
                        </TableCell>
                        <TableCell>{d.dateDebut}</TableCell>
                        <TableCell>{d.dateFin}</TableCell>
                        <TableCell>{d.duree}</TableCell>
                        <TableCell>
                          <Chip label={s.label} size="small" color={s.color} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ))}

      {/* ── Confirm Dialog ── */}
      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, mode: null, targetId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
          {dialog.mode === "approve"
            ? "Confirmer l'approbation"
            : "Confirmer le rejet"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label={
                dialog.mode === "reject"
                  ? "Motif du rejet *"
                  : "Commentaire (optionnel)"
              }
              multiline
              rows={3}
              size="small"
              fullWidth
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <AppButton
            text="Annuler"
            variant="outlined"
            onClick={() =>
              setDialog({ open: false, mode: null, targetId: null })
            }
            disabled={actionLoading}
          />
          <AppButton
            text={dialog.mode === "approve" ? "Approuver" : "Rejeter"}
            onClick={handleConfirm}
            loading={actionLoading}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChefDashboardPage;
