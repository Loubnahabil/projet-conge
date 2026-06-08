import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { EmptyState } from "@/components/atoms/EmptyState";
import { statsApi } from "@/api/Statsapi";
import { StatCard } from "@/components/molecules/StatCard";
import type { FonctionnaireDashboardStats } from "@/types/Stats.types";

const FonctionnaireDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<FonctionnaireDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    statsApi
      .getFonctionnaireDashboard()
      .then(setStats)
      .catch(() => setError("Erreur lors du chargement des statistiques."))
      .finally(() => setLoading(false));
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
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}
      >
        Tableau de bord
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
                label="Quota alloué"
                value={`${stats.quotaAlloue} jours`}
                sub="Année en cours"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Quota utilisé"
                value={`${stats.quotaUtilise} jours`}
                sub="Année en cours"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Quota restant"
                value={`${stats.quotaRestant} jours`}
                sub="Année en cours"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Total demandes"
                value={stats.totalDemandes}
                sub="Toutes périodes"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="En attente"
                value={stats.enAttenteVisa}
                sub="Visa chef"
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
              Faire une demande de congé
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/mes-demandes")}
            >
              Voir mes demandes
            </Button>
          </Box>

          <Paper
            sx={{
              p: 3,
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}
            >
              Demandes récentes
            </Typography>
            {stats.demandesRecentes.length === 0 ? (
              <EmptyState message="Aucune demande pour le moment." />
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
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#0f172a" }}
                      >
                        {demande.typeConge === "ANNUEL"
                          ? "Congé annuel"
                          : "Congé maladie"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {demande.dateDebut} → {demande.dateFin} ({demande.duree}{" "}
                        jours)
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
                                : demande.statut === "SOUMISE" ||
                                    demande.statut === "VISEE_CHEF"
                                  ? "#ca8a04"
                                  : "#64748b",
                        }}
                      >
                        {demande.statut === "BROUILLON" && "Brouillon"}
                        {demande.statut === "SOUMISE" && "Soumise"}
                        {demande.statut === "VISEE_CHEF" && "Visée par le chef"}
                        {demande.statut === "SIGNEE_DIRECTEUR" &&
                          "Signée par le directeur"}
                        {demande.statut === "REJETEE_CHEF" && "Rejetée (chef)"}
                        {demande.statut === "REJETEE_DIRECTEUR" &&
                          "Rejetée (directeur)"}
                        {demande.statut === "ANNULEE" && "Annulée"}
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
