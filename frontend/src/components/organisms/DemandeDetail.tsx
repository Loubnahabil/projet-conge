import { Box, Typography, Paper, IconButton, Button, Grid, Stack } from "@mui/material";
import { ArrowBack, Cancel } from "@mui/icons-material";
import { StatusChip } from "@/components/atoms/StatusChip";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { EmptyState } from "@/components/atoms/EmptyState";
import { DocumentFileLink } from "@/components/atoms/DocumentFileLink";
import { axiosInstance } from "@/api/axiosInstance";
import type { DemandeResponse, HistoryRecord } from "@/types/Demande.types";
import { useTranslation } from "react-i18next";
import { openBlobInNewTab } from "@/utils/fileUtils";
import { TYPE_TKEY } from "@/constants/constants";

interface DemandeDetailProps {
  selectedDemande: DemandeResponse;
  demandeHistory: HistoryRecord[];
  actionLoading: boolean;
  statutConfig: Record<
    string,
    {
      label: string;
      color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
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
  const { t } = useTranslation();
  const isCancelable =
    selectedDemande.statut === "BROUILLON" || selectedDemande.statut === "SOUMISE";

  const handleOpenPiece = async (pieceId: number) => {
    const response = await axiosInstance.get(`/demandes/${selectedDemande.id}/pieces/${pieceId}`, {
      responseType: "blob",
    });
    openBlobInNewTab(response.data);
  };

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
          <IconButton onClick={onBack} size="small" sx={{ border: "1px solid #cbd5e1" }}>
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              DEM-2026-00{selectedDemande.id} —{" "}
              {t(TYPE_TKEY[selectedDemande.typeConge] ?? selectedDemande.typeConge)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: "center" }}>
              <StatusChip statut={selectedDemande.statut} sx={{ fontWeight: 700 }} />
              <Typography variant="caption" color="textSecondary">
                {t("demandeDetail.enAttente")}
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
            {t("demandeDetail.annulerButton")}
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Left Card: Summary */}
        <Grid size={{ xs: 12, md: 7 }}>
          {selectedDemande.piecesJustificatives &&
            selectedDemande.piecesJustificatives.length > 0 && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px", mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}>
                  {t("demandeDetail.documentsSignes")}
                </Typography>
                <Stack spacing={1}>
                  {selectedDemande.piecesJustificatives.map((piece) => (
                    <DocumentFileLink
                      key={piece.id}
                      nomFichier={piece.nomFichier}
                      onClick={() => handleOpenPiece(piece.id)}
                    />
                  ))}
                </Stack>
              </Paper>
            )}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px", bgcolor: "#f8fafc" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}>
              {t("demandeDetail.infosDossier")}
            </Typography>
            <Stack spacing={2}>
              {[
                {
                  label: t("demandeDetail.typeConge"),
                  value: t(TYPE_TKEY[selectedDemande.typeConge] ?? selectedDemande.typeConge),
                },
                { label: t("demandeDetail.dateDepart"), value: selectedDemande.dateDebut },
                { label: t("demandeDetail.dateRetour"), value: selectedDemande.dateFin },
                {
                  label: t("demandeDetail.dureeAccordee"),
                  value: `${selectedDemande.duree} ${t("demandeTable.joursOuvrables", { count: selectedDemande.duree })}`,
                  bold: true,
                },
                { label: t("demandeDetail.anneeAdministrative"), value: "2026" },
                {
                  label: t("demandeDetail.interimDesigné"),
                  value: getInterimName(selectedDemande.interimId),
                  blue: true,
                },
              ].map((row, i, arr) => (
                <Box
                  key={row.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
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
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px", minHeight: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}>
              {t("demandeDetail.historiqueEtats")}
            </Typography>

            {actionLoading ? (
              <LoadingSpinner />
            ) : demandeHistory.length === 0 ? (
              <EmptyState message={t("demandeDetail.aucunHistorique")} />
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
                      {statutConfig[log.statutAction]?.label || log.statutAction}
                    </Typography>
                    {log.acteurNom && (
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                        {t("demandeDetail.par")} {log.acteurPrenom} {log.acteurNom}
                        {log.acteurRole ? ` (${log.acteurRole})` : ""}
                      </Typography>
                    )}
                    {log.commentaire && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          p: 1,
                          bgcolor: log.statutAction?.startsWith("REJETEE") ? "#fef2f2" : "#f8fafc",
                          borderRadius: "6px",
                          border: "1px solid",
                          borderColor: log.statutAction?.startsWith("REJETEE")
                            ? "#fecaca"
                            : "#e2e8f0",
                          color: log.statutAction?.startsWith("REJETEE") ? "#991b1b" : "#475569",
                          fontSize: "0.8rem",
                        }}
                      >
                        "{log.commentaire}"
                      </Typography>
                    )}
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
