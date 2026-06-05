import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import { Cancel, UploadFile, Download, Visibility } from "@mui/icons-material";
import type { DemandeResponse } from "../../types/Demande.types";

const STATUT_LABEL: Record<
  string,
  { label: string; color: "success" | "error" | "info" | "default" }
> = {
  SIGNEE_DIRECTEUR: { label: "Signée", color: "success" },
  REJETEE_DIRECTEUR: { label: "Rejetée direction", color: "error" },
  VISEE_CHEF: { label: "Visée chef", color: "info" },
};

interface SignataireDemandeTableProps {
  data: DemandeResponse[];
  showActions?: boolean;
  onSignClick?: (id: number) => void;
  onRejectClick?: (id: number) => void;
  onDownloadClick?: (id: number) => void;
  onViewClick?: (demande: DemandeResponse) => void;
  emptyMessage?: string;
}

export const SignataireDemandeTable = ({
  data,
  showActions = false,
  onSignClick,
  onRejectClick,
  onDownloadClick,
  onViewClick,
  emptyMessage = "Aucune demande trouvée.",
}: SignataireDemandeTableProps) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "none",
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              Fonctionnaire
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              Service
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              Type
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              Date début
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              Date fin
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              Durée (j)
            </TableCell>

            {showActions ? (
              <TableCell
                align="right"
                sx={{ fontWeight: 600, color: "#475569", pr: 4 }}
              >
                Actions
              </TableCell>
            ) : (
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Statut
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
                sx={{ py: 6, color: "#64748b" }}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((d) => {
              const statusConfig = STATUT_LABEL[d.statut] || {
                label: d.statut,
                color: "default" as const,
              };

              return (
                <TableRow key={d.id} sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {d.userNomComplet}
                  </TableCell>

                  <TableCell sx={{ color: "#475569" }}>
                    {d.userServiceNom}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={d.typeConge === "ANNUEL" ? "Annuel" : "Maladie"}
                      size="small"
                      color={d.typeConge === "ANNUEL" ? "primary" : "warning"}
                    />
                  </TableCell>

                  <TableCell>{d.dateDebut}</TableCell>
                  <TableCell>{d.dateFin}</TableCell>
                  <TableCell>{d.duree}</TableCell>

                  {showActions ? (
                    <TableCell align="right" sx={{ pr: 2 }}>
                      <Tooltip title="Voir détails">
                        <IconButton
                          size="small"
                          sx={{ color: "#2563eb", mr: 1 }}
                          onClick={() => onViewClick?.(d)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Signer et déposer le document">
                        <IconButton
                          size="small"
                          sx={{ color: "#2563eb", mr: 1 }}
                          onClick={() => onSignClick?.(d.id)}
                        >
                          <UploadFile fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Télécharger le PDF">
                        <IconButton
                          size="small"
                          sx={{ color: "#16a34a", mr: 1 }}
                          onClick={() => {
                            console.log("button clicked, id:", d.id);
                            onDownloadClick?.(d.id);
                          }}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Rejeter">
                        <IconButton
                          size="small"
                          sx={{ color: "#d32f2f" }}
                          onClick={() => onRejectClick?.(d.id)}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={statusConfig.label}
                          size="small"
                          color={statusConfig.color}
                        />
                        <Tooltip title="Voir détails">
                          <IconButton
                            size="small"
                            sx={{ color: "#94a3b8" }}
                            onClick={() => onViewClick?.(d)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
