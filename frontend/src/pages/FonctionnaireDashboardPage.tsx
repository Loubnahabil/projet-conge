import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Button, Alert, Paper } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { EmptyState } from "@/components/atoms/EmptyState";
import { statsApi } from "@/api/Statsapi";
import { StatCard } from "@/components/molecules/StatCard";
import type { FonctionnaireDashboardStats } from "@/types/Stats.types";
import { useTranslation } from "react-i18next";
import { TYPE_TKEY } from "@/constants/constants";

const FonctionnaireDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<FonctionnaireDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    statsApi
      .getFonctionnaireDashboard()
      .then((data) => { if (mounted) setStats(data); })
      .catch(() => { if (mounted) setError(t("profile.loadError")); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

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
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}>
        {t("dashboard.fonctionnaireTitle")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label={t("dashboard.quotaAlloue")}
                value={`${stats.quotaAlloue} ${t("demandeTable.jours")}`}
                sub={t("dashboard.anneeEnCours")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label={t("dashboard.quotaUtilise")}
                value={`${stats.quotaUtilise} ${t("demandeTable.jours")}`}
                sub={t("dashboard.anneeEnCours")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label={t("dashboard.quotaRestant")}
                value={`${stats.quotaRestant} ${t("demandeTable.jours")}`}
                sub={t("dashboard.anneeEnCours")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label={t("dashboard.totalDemandes")}
                value={stats.totalDemandes}
                sub={t("dashboard.toutesPeriodes")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label={t("dashboard.enAttente")}
                value={stats.enAttenteVisa}
                sub={t("dashboard.visaChef")}
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/mes-demandes")}
              sx={{ mr: 2 }}
            >
              {t("dashboard.faireDemande")}
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate("/mes-demandes")}>
              {t("dashboard.voirMesDemandes")}
            </Button>
          </Box>

          <Paper
            sx={{
              p: 3,
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
              {t("dashboard.demandesRecentes")}
            </Typography>
            {stats.demandesRecentes.length === 0 ? (
              <EmptyState message={t("dashboard.aucuneDemande")} />
            ) : (
              <Grid container spacing={2}>
                {stats.demandesRecentes.map((demande) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={demande.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: "8px",
                        borderColor: "#e2e8f0",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/mes-demandes")}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {t(TYPE_TKEY[demande.typeConge] ?? demande.typeConge)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {demande.dateDebut} → {demande.dateFin} ({demande.duree}{" "}
                        {t("demandeTable.jours")})
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          fontWeight: 500,
                          color:
                            demande.statut === "SIGNEE_DIRECTEUR"
                              ? "#16a34a"
                              : demande.statut === "REJETEE_CHEF" ||
                                  demande.statut === "REJETEE_DIRECTEUR"
                                ? "#dc2626"
                                : demande.statut === "SOUMISE" || demande.statut === "VISEE_CHEF"
                                  ? "#ca8a04"
                                  : "#64748b",
                        }}
                      >
                        {demande.statut === "BROUILLON" && t("status.brouillon")}
                        {demande.statut === "SOUMISE" && t("status.soumise")}
                        {demande.statut === "VISEE_CHEF" && t("status.viseeChef")}
                        {demande.statut === "SIGNEE_DIRECTEUR" && t("status.signeeDirecteur")}
                        {demande.statut === "REJETEE_CHEF" && t("status.rejeteeChef")}
                        {demande.statut === "REJETEE_DIRECTEUR" && t("status.rejeteeDirecteur")}
                        {demande.statut === "ANNULEE" && t("status.annulee")}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default FonctionnaireDashboardPage;
