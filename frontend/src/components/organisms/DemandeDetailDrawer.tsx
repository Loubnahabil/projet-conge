import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { DocumentFileLink } from "@/components/atoms/DocumentFileLink";
import { EmptyState } from "@/components/atoms/EmptyState";
import { axiosInstance } from "@/api/axiosInstance";
import type { DemandeResponse } from "@/types/Demande.types";
import { useTranslation } from "react-i18next";
import { openBlobInNewTab } from "@/utils/fileUtils";
import { TYPE_TKEY } from "@/constants/constants";

interface Props {
  open: boolean;
  demande: DemandeResponse | null;
  onClose: () => void;
}

export const DemandeDetailDrawer = ({ open, demande, onClose }: Props) => {
  const { t } = useTranslation();
  if (!demande) return null;

  const handleOpen = async (pieceId: number) => {
    const response = await axiosInstance.get(
      `/demandes/${demande!.id}/pieces/${pieceId}`,
      { responseType: "blob" },
    );
    openBlobInNewTab(response.data);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 440, p: 3 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            DEM-2026-00{demande.id}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="textSecondary">
          {t("detailDrawer.demandeur")}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {demande.userNomComplet}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {demande.userServiceNom}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="textSecondary">
          {t("detailDrawer.details")}
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1, mb: 3 }}>
          {[
            {
              label: t("detailDrawer.type"),
              value: t(TYPE_TKEY[demande.typeConge] ?? demande.typeConge),
            },
            { label: t("detailDrawer.dateDebut"), value: demande.dateDebut },
            { label: t("detailDrawer.dateFin"), value: demande.dateFin },
            { label: t("detailDrawer.duree"), value: `${demande.duree} ${t("demandeTable.joursOuvrables")}` },
            { label: t("detailDrawer.interim"), value: demande.interimNomComplet ?? "—" },
          ].map((row) => (
            <Stack
              key={row.label}
              direction="row"
              sx={{ justifyContent: "space-between" }}
            >
              <Typography variant="body2" color="textSecondary">
                {row.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.value}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="textSecondary">
          {t("detailDrawer.piecesJustificatives")}
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {!demande.piecesJustificatives?.length ? (
            <EmptyState message={t("detailDrawer.aucunFichier")} />
          ) : (
            demande.piecesJustificatives.map((piece) => (
              <DocumentFileLink
                key={piece.id}
                nomFichier={piece.nomFichier}
                onClick={() => handleOpen(piece.id)}
              />
            ))
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};
