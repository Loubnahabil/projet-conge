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
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { AppButton } from "../components/atoms/AppButton";
import { demandeApi } from "../api/demandeApi";
import type { DemandeResponse } from "../types/Demande.types";

export const ChefDashboardPage = () => {
  const [demandes, setDemandes] = useState<DemandeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // dialog state
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "approve" | "reject" | null;
    targetId: number | null;
  }>({ open: false, mode: null, targetId: null });
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        // FIXED: Now requesting pending validations for subordinate agents
        const data = await demandeApi.getDemandesAViser();
        setDemandes(data);
      } catch {
        setError("Erreur lors du chargement des demandes à viser.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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

      // FIXED: Refresh with supervisor dataset to keep security contexts happy
      const updated = await demandeApi.getDemandesAViser();
      setDemandes(updated);
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
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#1e293b", mb: 4 }}
      >
        Demandes en attente de visa
      </Typography>

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
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Fonctionnaire
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Service
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Type
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Date début
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Date fin
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Durée (j)
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Intérimaire
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, color: "#475569", pr: 4 }}
              >
                Actions
              </TableCell>
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
                <TableRow key={d.id} sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}>
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

      {/* Confirm Dialog */}
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
