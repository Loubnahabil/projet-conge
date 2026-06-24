import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Alert, Tabs, Tab, Grid } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { statsApi } from "@/api/Statsapi";
import { ChefDemandeTable } from "@/components/organisms/ChefDemandeTable";
import { ChefDecisionModal } from "@/components/organisms/ChefDecisionModal";
import { StatCard } from "@/components/molecules/StatCard";
import {
  fetchPendingChefVisas,
  fetchTraiteesChef,
  visaChef,
} from "@/store/slices/demandeSlice";
import type { AppDispatch, RootState } from "@/store";
import type { ChefDashboardStats } from "@/types/Stats.types";
import { useTranslation } from "react-i18next";

export const ChefDashboardPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pendingChefVisas, traiteesChef, chefLoading, actionLoading, error } = useSelector(
    (state: RootState) => state.demande,
  );

  const [tab, setTab] = useState(0);
  const [loadingTraitees, setLoadingTraitees] = useState(false);
  const [traiteesFetched, setTraiteesFetched] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<ChefDashboardStats | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "approve" | "reject" | null;
    targetId: number | null;
  }>({ open: false, mode: null, targetId: null });

  useEffect(() => {
    let mounted = true;
    dispatch(fetchPendingChefVisas());
    statsApi
      .getChefDashboard()
      .then((data) => { if (mounted) setDashboardStats(data); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [dispatch]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    if (newValue === 1 && !traiteesFetched) {
      setLoadingTraitees(true);
      dispatch(fetchTraiteesChef()).finally(() => {
        setLoadingTraitees(false);
        setTraiteesFetched(true);
      });
    }
  };

  const handleOpenDecisionWorkflow = (mode: "approve" | "reject", id: number) => {
    setDialog({ open: true, mode, targetId: id });
  };

  const handleExecuteWorkflowAction = async (commentText: string) => {
    if (!dialog.targetId || !dialog.mode) return;
    try {
      await dispatch(
        visaChef({
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
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}>
        {t("chef.title")}
      </Typography>

      {dashboardStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("chef.enAttenteVisa")}
              value={dashboardStats.enAttenteVisa}
              sub={t("chef.aTraiter")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("chef.approuvees")}
              value={dashboardStats.approuvees}
              sub={t("dashboard.total")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("chef.rejetees")}
              value={dashboardStats.rejetees}
              sub={t("dashboard.total")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("chef.traitees")}
              value={dashboardStats.totalTraitees}
              sub={t("dashboard.toutesPeriodes")}
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
        <Tab label={`${t("chef.aViser")} (${pendingDemandes.length})`} />
        <Tab label={t("chef.demandesTraitees")} />
      </Tabs>

      {tab === 0 && (
        <ChefDemandeTable
          data={pendingDemandes}
          showActions
          onActionClick={handleOpenDecisionWorkflow}
          onViewClick={(d) => navigate(`/chef/demandes/${d.id}`)}
          emptyMessage={t("chef.aucuneAttente")}
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
            onViewClick={(d) => navigate(`/chef/demandes/${d.id}`)}
            emptyMessage={t("chef.aucuneTraitee")}
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

    </Box>
  );
};

export default ChefDashboardPage;
