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

// FIX IMPORTS: Changement des imports nommés en imports par défaut pour correspondre aux fichiers
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

  // FIX EFFECT: Fetch isolé pour éviter les rendus en cascade synchrones
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoadingPending(true);
      try {
        const data = await demandeApi.getDemandesASigner();
        if (isMounted) {
          setDemandes(data);
        }
      } catch {
        if (isMounted) {
          setError("Erreur lors du chargement des demandes à signer.");
        }
      } finally {
        if (isMounted) {
          setLoadingPending(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fonction de rechargement manuel après une action (hors useEffect, donc aucun risque de cascade)
  const reloadPendingDemandes = async () => {
    try {
      const data = await demandeApi.getDemandesASigner();
      setDemandes(data);
    } catch {
      setError("Erreur lors du rafraîchissement des demandes.");
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    if (newValue === 1 && !traiteesFetched) {
      setLoadingTraitees(true);
      demandeApi
        .getDemandesTraiteesSignataire()
        .then((data) => {
          setTraitees(data);
          setTraiteesFetched(true);
        })
        .catch(() =>
          setError("Erreur lors du chargement des demandes traitées."),
        )
        .finally(() => {
          setLoadingTraitees(false);
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

  const handleDownloadPdf = async (id: number) => {
    console.log("clicking download for id:", id);
    try {
      await demandeApi.generatePdf(id);
    } catch (err) {
      console.error("PDF error:", err);
      setError("Erreur lors du téléchargement du PDF.");
    }
  };

  const handleExecuteReject = async (commentaire: string) => {
    if (!rejectDialog.targetId) return;
    setActionLoading(true);
    setError(null);
    try {
      await demandeApi.rejetSignataire(rejectDialog.targetId, { commentaire });
      setRejectDialog({ open: false, targetId: null });
      setTraiteesFetched(false);
      await reloadPendingDemandes();
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
      await demandeApi.uploadDocument(
        uploadDialog.targetId,
        file,
        "DECISION_SIGNEE",
      );
      setUploadDialog({ open: false, targetId: null });
      setTraiteesFetched(false);
      await reloadPendingDemandes();
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

  console.log("pendingDemandes:", pendingDemandes);
  console.log("all demandes:", demandes);
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

      {tab === 0 && (
        <SignataireDemandeTable
          data={pendingDemandes}
          showActions
          onSignClick={handleOpenSign}
          onRejectClick={handleOpenReject}
          onDownloadClick={handleDownloadPdf} // ← add this
          emptyMessage="Aucune demande en attente de signature."
        />
      )}

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

      <SignataireDecisionModal
        open={rejectDialog.open}
        error={error}
        actionLoading={actionLoading}
        onCancel={() => setRejectDialog({ open: false, targetId: null })}
        onConfirm={handleExecuteReject}
      />

      <SignataireUploadModal
        open={uploadDialog.open}
        // targetId={uploadDialog.targetId}  <-- supprime cette ligne
        error={error}
        actionLoading={actionLoading}
        onCancel={() => setUploadDialog({ open: false, targetId: null })}
        onUpload={handleExecuteUpload}
      />
    </Box>
  );
};

export default SignatairePage;
