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
import { ChefDemandeTable } from "../components/organisms/ChefDemandeTable";
import { ChefDecisionModal } from "../components/organisms/ChefDecisionModal";
import { DemandeDetailDrawer } from "../components/organisms/DemandeDetailDrawer";
import type { DemandeResponse } from "../types/Demande.types";

export const ChefDashboardPage = () => {
  const [tab, setTab] = useState(0);

  // Data Store Lists
  const [demandes, setDemandes] = useState<DemandeResponse[]>([]);
  const [traitees, setTraitees] = useState<DemandeResponse[]>([]);

  // Loaders
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingTraitees, setLoadingTraitees] = useState(false);
  const [traiteesFetched, setTraiteesFetched] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Error States & Interactive Modal Configuration
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "approve" | "reject" | null;
    targetId: number | null;
  }>({ open: false, mode: null, targetId: null });

  // Detail Drawer Target State
  const [drawerDemande, setDrawerDemande] = useState<DemandeResponse | null>(
    null,
  );

  // Initial fetch for pending workspace demands
  useEffect(() => {
    demandeApi
      .getDemandesAViser()
      .then(setDemandes)
      .catch(() => setError("Erreur lors du chargement des demandes à viser."))
      .finally(() => setLoadingPending(false));
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
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

  const handleOpenDecisionWorkflow = (
    mode: "approve" | "reject",
    id: number,
  ) => {
    setError(null);
    setDialog({ open: true, mode, targetId: id });
  };

  const handleExecuteWorkflowAction = async (commentText: string) => {
    if (!dialog.targetId || !dialog.mode) return;

    setActionLoading(true);
    setError(null);
    try {
      await demandeApi.visaChef(dialog.targetId, dialog.mode === "approve", {
        commentaire: commentText || undefined,
      });

      // Refresh data models seamlessly
      const updatedPending = await demandeApi.getDemandesAViser();
      setDemandes(updatedPending);

      // Invalidate the cache of the treated list so it refreshes next time it mounts
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

  const pendingDemandes = demandes.filter((d) => d.statut === "SOUMISE");

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

      {/* Tab 0: Pending */}
      {tab === 0 && (
        <ChefDemandeTable
          data={pendingDemandes}
          showActions
          onActionClick={handleOpenDecisionWorkflow}
          onViewClick={(d) => setDrawerDemande(d)}
          emptyMessage="Aucune demande en attente de visa."
        />
      )}

      {/* Tab 1: Treated */}
      {tab === 1 &&
        (loadingTraitees ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ChefDemandeTable
            data={traitees}
            onViewClick={(d) => setDrawerDemande(d)}
            emptyMessage="Aucune demande traitée pour l'instant."
          />
        ))}

      {/* Workflow Execution Decision Popup (Organism) */}
      <ChefDecisionModal
        open={dialog.open}
        mode={dialog.mode}
        error={error}
        actionLoading={actionLoading}
        onCancel={() => setDialog({ open: false, mode: null, targetId: null })}
        onConfirm={handleExecuteWorkflowAction}
      />

      {/* Detail Right Side Drawer */}
      <DemandeDetailDrawer
        open={!!drawerDemande}
        demande={drawerDemande}
        onClose={() => setDrawerDemande(null)}
      />
    </Box>
  );
};

export default ChefDashboardPage;
