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
  Tabs,
  Tab,
} from "@mui/material";
import { Cancel, UploadFile } from "@mui/icons-material";
import { AppButton } from "../components/atoms/AppButton";
import { demandeApi } from "../api/demandeApi";
import type { DemandeResponse } from "../types/Demande.types";

const statutLabel: Record<
  string,
  { label: string; color: "success" | "error" | "info" | "default" }
> = {
  SIGNEE_DIRECTEUR: { label: "Signée", color: "success" },
  REJETEE_DIRECTEUR: { label: "Rejetée direction", color: "error" },
};

export const SignatairePage = () => {
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
    demandeApi
      .getDemandesASigner()
      .then(setDemandes)
      .catch(() => setError("Erreur lors du chargement des demandes."))
      .finally(() => setLoadingPending(false));
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    if (newValue === 1 && !traiteesFetched) {
      setLoadingTraitees(true);
      demandeApi
        .getDemandesTraiteesSignataire()
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
      const updated = await demandeApi.getDemandesASigner();
      setDemandes(updated);
      setTraiteesFetched(false); // invalidate cache
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
      const updated = await demandeApi.getDemandesASigner();
      setDemandes(updated);
      setTraiteesFetched(false); // invalidate cache
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

  const commonHeadCell = { fontWeight: 600, color: "#475569" };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}
      >
        Tableau de bord — Signataire
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
        <Tab label={`À signer (${pendingDemandes.length})`} />
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
                <TableCell sx={commonHeadCell}>Fonctionnaire</TableCell>
                <TableCell sx={commonHeadCell}>Service</TableCell>
                <TableCell sx={commonHeadCell}>Type</TableCell>
                <TableCell sx={commonHeadCell}>Date début</TableCell>
                <TableCell sx={commonHeadCell}>Date fin</TableCell>
                <TableCell sx={commonHeadCell}>Durée (j)</TableCell>
                <TableCell align="right" sx={{ ...commonHeadCell, pr: 4 }}>
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
                  <TableCell sx={commonHeadCell}>Fonctionnaire</TableCell>
                  <TableCell sx={commonHeadCell}>Service</TableCell>
                  <TableCell sx={commonHeadCell}>Type</TableCell>
                  <TableCell sx={commonHeadCell}>Date début</TableCell>
                  <TableCell sx={commonHeadCell}>Date fin</TableCell>
                  <TableCell sx={commonHeadCell}>Durée (j)</TableCell>
                  <TableCell sx={commonHeadCell}>Statut</TableCell>
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

      {/* ── Reject Dialog ── */}
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
            {error && <Alert severity="error">{error}</Alert>}
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

      {/* ── Upload Dialog ── */}
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
            {error && <Alert severity="error">{error}</Alert>}
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
