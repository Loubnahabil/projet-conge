import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { demandeApi } from "../api/demandeApi";
import { SignataireDemandeTable } from "../components/organisms/SignataireDemandeTable";
import { SignataireDecisionModal } from "../components/organisms/SignataireDecisionModal";
import { SignataireUploadModal } from "../components/organisms/SignataireUploadModal";
import type { DemandeResponse } from "../types/Demande.types";

export const SignatairePage = () => {
  const [tab, setTab] = useState(0);

  // Data Collections
  const [demandes, setDemandes] = useState<DemandeResponse[]>([]);
  const [traitees, setTraitees] = useState<DemandeResponse[]>([]);

  // Status flags
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingTraitees, setLoadingTraitees] = useState(false);
  const [traiteesFetched, setTraiteesFetched] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal contexts
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    targetId: number | null;
  }>({
    open: false,
    targetId: null,
  });
  const [uploadDialog, setUploadDialog] = useState<{
    open: boolean;
    targetId: number | null;
  }>({
    open: false,
    targetId: null,
  });

  // Fetch pending validation items on mount
  useEffect(() => {
    demandeApi
      .getDemandesASigner()
      .then(setDemandes)
      .catch(() => setError("Erreur lors du chargement des demandes à signer."))
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

  const handleOpenReject = (id: number) => {
    setError(null);
    setRejectDialog({ open: true, targetId: id });
  };

  const handleOpenSign = (id: number) => {
    setError(null);
    setUploadDialog({ open: true, targetId: id });
  };

  const handleExecuteReject = async (commentaire: string) => {
    if (!rejectDialog.targetId) return;
    setActionLoading(true);
    setError(null);
    try {
      await demandeApi.rejetSignataire(rejectDialog.targetId, { commentaire });

      // Sync list
      const updated = await demandeApi.getDemandesASigner();
      setDemandes(updated);
      setTraiteesFetched(false);
      setRejectDialog({ open: false, targetId: null });
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

  const handleExecuteUpload = async (file: File) => {
    if (!uploadDialog.targetId) return;
    setActionLoading(true);
    setError(null);
    try {
      // FIXED: Using your exact API method and payload configurations here
      await demandeApi.uploadDocument(
        uploadDialog.targetId,
        file,
        "DECISION_SIGNEE",
      );

      // Sync list seamlessly
      const updated = await demandeApi.getDemandesASigner();
      setDemandes(updated);
      setTraiteesFetched(false);
      setUploadDialog({ open: false, targetId: null });
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { error?: string; message?: string } };
      };
      setError(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Erreur lors du dépôt.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Only render matching requests
  const pendingDemandes = demandes.filter((d) => d.statut === "VISEE_CHEF");

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

      {/* Tab 0: Queue */}
      {tab === 0 && (
        <SignataireDemandeTable
          data={pendingDemandes}
          showActions
          onSignClick={handleOpenSign}
          onRejectClick={handleOpenReject}
          emptyMessage="Aucune demande en attente de signature."
        />
      )}

      {/* Tab 1: History logs */}
      {tab === 1 &&
        (loadingTraitees ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <SignataireDemandeTable
            data={traitees}
            emptyMessage="Aucune demande traitée pour l'instant."
          />
        ))}

      {/* Rejection Comment Modal */}
      <SignataireDecisionModal
        open={rejectDialog.open}
        error={error}
        actionLoading={actionLoading}
        onCancel={() => setRejectDialog({ open: false, targetId: null })}
        onConfirm={handleExecuteReject}
      />

      {/* Document Arrêté Upload Modal */}
      <SignataireUploadModal
        open={uploadDialog.open}
        error={error}
        actionLoading={actionLoading}
        onCancel={() => setUploadDialog({ open: false, targetId: null })}
        onUpload={handleExecuteUpload}
      />
    </Box>
  );
};

export default SignatairePage;
