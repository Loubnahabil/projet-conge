import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Grid,
  Stack,
} from "@mui/material";
import { ArrowBack, Cancel } from "@mui/icons-material";
import type { DemandeResponse, HistoryRecord } from "../../types/Demande.types";

interface DemandeDetailProps {
  selectedDemande: DemandeResponse;
  demandeHistory: HistoryRecord[];
  actionLoading: boolean;
  statutConfig: Record<
    string,
    {
      label: string;
      color:
        | "default"
        | "primary"
        | "secondary"
        | "error"
        | "info"
        | "success"
        | "warning";
    }
  >;
  onBack: () => void;
  onCancelClick: (id: number) => void;
  getInterimName: (id?: number) => string;
  formatDate: (iso: string) => string;
}

export const DemandeDetail = ({
  selectedDemande,
  demandeHistory,
  actionLoading,
  statutConfig,
  onBack,
  onCancelClick,
  getInterimName,
  formatDate,
}: DemandeDetailProps) => {
  const isCancelable =
    selectedDemande.statut === "BROUILLON" ||
    selectedDemande.statut === "SOUMISE";

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <IconButton
            onClick={onBack}
            size="small"
            sx={{ border: "1px solid #cbd5e1" }}
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              DEM-2026-00{selectedDemande.id} —{" "}
              {selectedDemande.typeConge === "ANNUEL"
                ? "Congé annuel"
                : "Congé maladie"}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 0.5, alignItems: "center" }}
            >
              <Chip
                label={
                  statutConfig[selectedDemande.statut]?.label ||
                  selectedDemande.statut
                }
                color={statutConfig[selectedDemande.statut]?.color || "default"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Typography variant="caption" color="textSecondary">
                En attente de traitement par le circuit administratif
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {isCancelable && (
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<Cancel />}
            onClick={() => onCancelClick(selectedDemande.id)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
          >
            Annuler la demande
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Left Card: Summary */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: "12px", bgcolor: "#f8fafc" }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
            >
              INFORMATIONS DOSSIER
            </Typography>
            <Stack spacing={2}>
              {[
                {
                  label: "Type de congé",
                  value:
                    selectedDemande.typeConge === "ANNUEL"
                      ? "Congé Annuel"
                      : "Congé Maladie",
                },
                { label: "Date de départ", value: selectedDemande.dateDebut },
                { label: "Date de retour", value: selectedDemande.dateFin },
                {
                  label: "Durée accordée",
                  value: `${selectedDemande.duree} jours ouvrables`,
                  bold: true,
                },
                { label: "Année administrative", value: "2026" },
                {
                  label: "Intérim désigné",
                  value: getInterimName(selectedDemande.interimId),
                  blue: true,
                },
              ].map((row, i, arr) => (
                <Box
                  key={row.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom:
                      i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
                    pb: i < arr.length - 1 ? 1 : 0,
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    {row.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: row.bold ? 700 : 600,
                      color: row.blue ? "#2563eb" : "#0f172a",
                    }}
                  >
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Right Card: Tracks */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: "12px", minHeight: "100%" }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}
            >
              HISTORIQUE DES ETATS
            </Typography>

            {actionLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : demandeHistory.length === 0 ? (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ fontStyle: "italic" }}
              >
                Aucun historique de suivi enregistré.
              </Typography>
            ) : (
              <Stack
                spacing={3}
                sx={{
                  position: "relative",
                  pl: 2,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: "4px",
                    top: "8px",
                    bottom: "8px",
                    width: "2px",
                    bgcolor: "#e2e8f0",
                  },
                }}
              >
                {demandeHistory.map((log, index) => (
                  <Box key={log.id} sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: "-16px",
                        top: "4px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        bgcolor: index === 0 ? "#2563eb" : "#cbd5e1",
                        border: index === 0 ? "2px solid #93c5fd" : "none",
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        display: "block",
                        fontWeight: 500,
                        fontFamily: "monospace",
                      }}
                    >
                      {formatDate(log.dateAction)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: index === 0 ? "#0f172a" : "#475569",
                        mt: 0.2,
                      }}
                    >
                      {statutConfig[log.statutAction]?.label ||
                        log.statutAction}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
