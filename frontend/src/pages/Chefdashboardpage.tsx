import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { LoadingSpinner } from "../components/atoms/LoadingSpinner";
import { statsApi } from "../api/Statsapi";
import { ChefDemandeTable } from "../components/organisms/ChefDemandeTable";
import { ChefDecisionModal } from "../components/organisms/ChefDecisionModal";
import { DemandeDetailDrawer } from "../components/organisms/DemandeDetailDrawer";
import { StatCard } from "../components/molecules/StatCard";
import {
  fetchPendingChefVisasThunk,
  fetchTraiteesChefThunk,
  visaChefThunk,
} from "../store/slices/demandeSlice";
import type { AppDispatch, RootState } from "../store";
import type { DemandeResponse } from "../types/Demande.types";
import type { ChefDashboardStats } from "../types/Stats.types";

export const ChefDashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingChefVisas, traiteesChef, chefLoading, actionLoading, error } =
    useSelector((state: RootState) => state.demande);

  const [tab, setTab] = useState(0);
  const [loadingTraitees, setLoadingTraitees] = useState(false);
  const [traiteesFetched, setTraiteesFetched] = useState(false);
  const [dashboardStats, setDashboardStats] =
    useState<ChefDashboardStats | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "approve" | "reject" | null;
    targetId: number | null;
  }>({ open: false, mode: null, targetId: null });
  const [drawerDemande, setDrawerDemande] = useState<DemandeResponse | null>(null);

  useEffect(() => {
    dispatch(fetchPendingChefVisasThunk());
    statsApi
      .getChefDashboard()
      .then(setDashboardStats)
      .catch(() => {});
  }, [dispatch]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    if (newValue === 1 && !traiteesFetched) {
      setLoadingTraitees(true);
      dispatch(fetchTraiteesChefThunk()).finally(() => {
        setLoadingTraitees(false);
        setTraiteesFetched(true);
      });
    }
  };

  const handleOpenDecisionWorkflow = (
    mode: "approve" | "reject",
    id: number,
  ) => {
    setDialog({ open: true, mode, targetId: id });
  };

  const handleExecuteWorkflowAction = async (commentText: string) => {
    if (!dialog.targetId || !dialog.mode) return;
    try {
      await dispatch(
        visaChefThunk({
          id: dialog.targetId,
          approve: dialog.mode === "approve",
          commentaire: commentText || undefined,
        }),
      ).unwrap();
      setTraiteesFetched(false);
      setDialog({ open: false, mode: null, targetId: null });
    } catch {
      // error in Redux
    }
  };

  const pendingDemandes = pendingChefVisas.filter((d) => d.statut === "SOUMISE");

  if (chefLoading && pendingChefVisas.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LoadingSpinner />
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

      {dashboardStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="En attente de visa"
              value={dashboardStats.enAttenteVisa}
              sub="Demandes à traiter"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Approuvées"
              value={dashboardStats.approuvees}
              sub="Total"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Rejetées"
              value={dashboardStats.rejetees}
              sub="Total"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Total traitées"
              value={dashboardStats.totalTraitees}
              sub="Toutes périodes"
            />
          </Grid>
        </Grid>
      )}

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

      {tab === 0 && (
        <ChefDemandeTable
          data={pendingDemandes}
          showActions
          onActionClick={handleOpenDecisionWorkflow}
          onViewClick={(d) => setDrawerDemande(d)}
          emptyMessage="Aucune demande en attente de visa."
        />
      )}

      {tab === 1 &&
        (loadingTraitees ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
            <LoadingSpinner />
          </Box>
        ) : (
          <ChefDemandeTable
            data={traiteesChef}
            onViewClick={(d) => setDrawerDemande(d)}
            emptyMessage="Aucune demande traitée pour l'instant."
          />
        ))}

      <ChefDecisionModal
        open={dialog.open}
        mode={dialog.mode}
        error={error}
        actionLoading={actionLoading}
        onCancel={() => setDialog({ open: false, mode: null, targetId: null })}
        onConfirm={handleExecuteWorkflowAction}
      />

      <DemandeDetailDrawer
        open={!!drawerDemande}
        demande={drawerDemande}
        onClose={() => setDrawerDemande(null)}
      />
    </Box>
  );
};

export default ChefDashboardPage;
