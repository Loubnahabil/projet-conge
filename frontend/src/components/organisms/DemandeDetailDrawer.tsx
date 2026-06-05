import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import { Close, InsertDriveFile } from "@mui/icons-material";
import type { DemandeResponse } from "../../types/Demande.types";

interface Props {
  open: boolean;
  demande: DemandeResponse | null;
  onClose: () => void;
}

export const DemandeDetailDrawer = ({ open, demande, onClose }: Props) => {
  if (!demande) return null;

  // Clean signature without the unused nomFichier parameter
  const handleOpen = async (pieceId: number) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `http://localhost:8080/api/demandes/${demande!.id}/pieces/${pieceId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
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
          Demandeur
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {demande.userNomComplet}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {demande.userServiceNom}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="textSecondary">
          Détails
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1, mb: 3 }}>
          {[
            {
              label: "Type",
              value:
                demande.typeConge === "ANNUEL"
                  ? "Congé Annuel"
                  : "Congé Maladie",
            },
            { label: "Date début", value: demande.dateDebut },
            { label: "Date fin", value: demande.dateFin },
            { label: "Durée", value: `${demande.duree} jours ouvrables` },
            { label: "Intérim", value: demande.interimNomComplet ?? "—" },
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
          Pièces justificatives
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {!demande.piecesJustificatives?.length ? (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontStyle: "italic" }}
            >
              Aucun fichier joint.
            </Typography>
          ) : (
            demande.piecesJustificatives.map((piece) => (
              <Stack
                key={piece.id}
                direction="row"
                spacing={1}
                onClick={() => handleOpen(piece.id)} // Updated clean handler call
                sx={{
                  alignItems: "center",
                  p: 1.5,
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  bgcolor: "#f8fafc",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" },
                }}
              >
                <InsertDriveFile sx={{ color: "#64748b", fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {piece.nomFichier}
                  </Typography>
                </Box>
              </Stack>
            ))
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};
