import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Alert, Tabs, Tab, Grid } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { statsApi } from "@/api/Statsapi";
import { SignataireDemandeTable } from "@/components/organisms/SignataireDemandeTable";
import { SignataireDecisionModal } from "@/components/organisms/SignataireDecisionModal";
import { SignataireUploadModal } from "@/components/organisms/SignataireUploadModal";
import { DemandeDetailDrawer } from "@/components/organisms/DemandeDetailDrawer";
import { demandeApi } from "@/api/demandeApi";
import { StatCard } from "@/components/molecules/StatCard";
import {
  fetchPendingSignatures,
  fetchTraiteesSignataire,
  signataireApprove,
  signataireReject,
} from "@/store/slices/demandeSlice";
import type { AppDispatch, RootState } from "@/store";
import type { DemandeResponse } from "@/types/Demande.types";
import type { SignataireDashboardStats } from "@/types/Stats.types";
import { useTranslation } from "react-i18next";

export const SignatairePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { pendingSignatures, traiteesSignataire, signataireLoading, actionLoading, error } =
    useSelector((state: RootState) => state.demande);

  const [tab, setTab] = useState(0);
  const [loadingTraitees, setLoadingTraitees] = useState(false);
  const [traiteesFetched, setTraiteesFetched] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<SignataireDashboardStats | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    targetId: number | null;
  }>({ open: false, targetId: null });
  const [drawerDemande, setDrawerDemande] = useState<DemandeResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    dispatch(fetchPendingSignatures());
    statsApi
      .getSignataireDashboard()
      .then((data) => { if (mounted) setDashboardStats(data); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [dispatch]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    if (newValue === 1 && !traiteesFetched) {
      setLoadingTraitees(true);
      dispatch(fetchTraiteesSignataire()).finally(() => {
        setLoadingTraitees(false);
        setTraiteesFetched(true);
      });
    }
  };

  const handleUpload = async (file: File) => {
    if (!uploadTargetId) return;
    try {
      await dispatch(signataireApprove({ id: uploadTargetId, file })).unwrap();
      setUploadTargetId(null);
      setTraiteesFetched(false);
    } catch {
      // error in Redux
    }
  };

  const handleReject = async (commentaire: string) => {
    if (!rejectDialog.targetId) return;
    try {
      await dispatch(signataireReject({ id: rejectDialog.targetId, commentaire })).unwrap();
      setTraiteesFetched(false);
      setRejectDialog({ open: false, targetId: null });
    } catch {
      // error in Redux
    }
  };

  const pendingDemandes = pendingSignatures.filter((d) => d.statut === "VISEE_CHEF");

  if (signataireLoading && pendingSignatures.length === 0) {
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
        {t("signataire.title")}
      </Typography>

      {dashboardStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("signataire.enAttenteSignature")}
              value={dashboardStats.enAttenteSignature}
              sub={t("signataire.aTraiter")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("signataire.signees")}
              value={dashboardStats.signees}
              sub={t("dashboard.total")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("signataire.rejetees")}
              value={dashboardStats.rejetees}
              sub={t("dashboard.total")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={t("signataire.traitees")}
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
        <Tab label={`${t("signataire.aSigner")} (${pendingDemandes.length})`} />
        <Tab label={t("signataire.demandesTraitees")} />
      </Tabs>

      {tab === 0 && (
        <SignataireDemandeTable
          data={pendingDemandes}
          showActions
          onSignClick={(id) => setUploadTargetId(id)}
          onDownloadClick={(id) => demandeApi.generatePdf(id)}
          onRejectClick={(id) => setRejectDialog({ open: true, targetId: id })}
          onViewClick={(d) => setDrawerDemande(d)}
          emptyMessage={t("signataire.aucuneAttente")}
        />
      )}

      {tab === 1 &&
        (loadingTraitees ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
            <LoadingSpinner />
          </Box>
        ) : (
          <SignataireDemandeTable
            data={traiteesSignataire}
            onViewClick={(d) => setDrawerDemande(d)}
            emptyMessage={t("signataire.aucuneTraitee")}
          />
        ))}

      <SignataireUploadModal
        open={uploadTargetId !== null}
        error={error}
        actionLoading={actionLoading}
        onCancel={() => setUploadTargetId(null)}
        onUpload={handleUpload}
      />

      <SignataireDecisionModal
        open={rejectDialog.open}
        actionLoading={actionLoading}
        error={error}
        onClose={() => setRejectDialog({ open: false, targetId: null })}
        onConfirm={handleReject}
      />

      <DemandeDetailDrawer
        open={!!drawerDemande}
        demande={drawerDemande}
        onClose={() => setDrawerDemande(null)}
      />
    </Box>
  );
};

export default SignatairePage;
