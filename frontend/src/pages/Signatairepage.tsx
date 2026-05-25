import { useState, useEffect, useRef } from "react";
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
import { Cancel, UploadFile } from "@mui/icons-material";
import { AppButton } from "../components/atoms/AppButton";
import { demandeApi } from "../api/demandeApi";
import type { DemandeResponse } from "../types/Demande.types";

export const SignatairePage = () => {
  const [demandes, setDemandes] = useState<DemandeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // reject dialog
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    targetId: number | null;
  }>({ open: false, targetId: null });
  const [commentaire, setCommentaire] = useState("");

  // upload dialog
  const [uploadDialog, setUploadDialog] = useState<{
    open: boolean;
    targetId: number | null;
  }>({ open: false, targetId: null });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ FIXED: Now calls the specific signature queue instead of personal requests
        const data = await demandeApi.getDemandesASigner();
        setDemandes(data);
      } catch {
        setError("Erreur lors du chargement des demandes.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const pendingDemandes = demandes.filter((d) => d.statut === "VISEE_CHEF");

  const handleReject = async () => {
    if (!rejectDialog.targetId) return;
    if (!commentaire.trim()) {
      setError("Un commentaire est obligatoire.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await demandeApi.rejetSignataire(rejectDialog.targetId, { commentaire });

      // ✅ FIXED: Refresh the board using the correct management queue endpoint
      const updated = await demandeApi.getDemandesASigner();
      setDemandes(updated);

      setRejectDialog({ open: false, targetId: null });
      setCommentaire("");
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { error?: string; message?: string } };
      };
      setError(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Erreur lors du rejet.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadDialog.targetId || !selectedFile) return;
    setActionLoading(true);
    setError(null);
    try {
      await demandeApi.uploadDocument(
        uploadDialog.targetId,
        selectedFile,
        "DECISION_SIGNEE",
      );

      // ✅ FIXED: Refresh the board using the correct management queue endpoint
      const updated = await demandeApi.getDemandesASigner();
      setDemandes(updated);

      setUploadDialog({ open: false, targetId: null });
      setSelectedFile(null);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { error?: string; message?: string } };
      };
      setError(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Erreur lors de l'upload.",
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
        Demandes visées — en attente de signature
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
                  colSpan={7}
                  align="center"
                  sx={{ py: 6, color: "#64748b" }}
                >
                  Aucune demande en attente de signature.
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
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <Tooltip title="Déposer décision signée">
                      <IconButton
                        size="small"
                        sx={{ color: "#16a34a", mr: 1 }}
                        onClick={() => {
                          setSelectedFile(null);
                          setError(null);
                          setUploadDialog({ open: true, targetId: d.id });
                        }}
                      >
                        <UploadFile fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rejeter">
                      <IconButton
                        size="small"
                        sx={{ color: "#d32f2f" }}
                        onClick={() => {
                          setCommentaire("");
                          setError(null);
                          setRejectDialog({ open: true, targetId: d.id });
                        }}
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

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, targetId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
          Rejeter la demande
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Motif du rejet *"
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
            onClick={() => setRejectDialog({ open: false, targetId: null })}
            disabled={actionLoading}
          />
          <AppButton
            text="Rejeter"
            onClick={handleReject}
            loading={actionLoading}
          />
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog.open}
        onClose={() => setUploadDialog({ open: false, targetId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
          Déposer la décision signée
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <AppButton
              text={selectedFile ? selectedFile.name : "Choisir un fichier"}
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <AppButton
            text="Annuler"
            variant="outlined"
            onClick={() => setUploadDialog({ open: false, targetId: null })}
            disabled={actionLoading}
          />
          <AppButton
            text="Déposer"
            onClick={handleUpload}
            loading={actionLoading}
            disabled={!selectedFile}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignatairePage;
