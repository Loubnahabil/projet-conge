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
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import type { DemandeResponse } from "../../types/Demande.types";

const STATUT_LABEL: Record<
  string,
  { label: string; color: "success" | "error" | "info" | "default" }
> = {
  VISEE_CHEF: { label: "Visée", color: "success" },
  REJETEE_CHEF: { label: "Rejetée", color: "error" },
  SIGNEE_DIRECTEUR: { label: "Signée directeur", color: "info" },
  REJETEE_DIRECTEUR: { label: "Rejetée direction", color: "error" },
};

interface ChefDemandeTableProps {
  data: DemandeResponse[];
  showActions?: boolean;
  onActionClick?: (mode: "approve" | "reject", id: number) => void;
  emptyMessage?: string;
}

export const ChefDemandeTable = ({
  data,
  showActions = false,
  onActionClick,
  emptyMessage = "Aucune demande trouvée.",
}: ChefDemandeTableProps) => {
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
                colSpan={showActions ? 7 : 7}
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
                color: "default",
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
                      <Tooltip title="Approuver">
                        <IconButton
                          size="small"
                          sx={{ color: "#16a34a", mr: 1 }}
                          onClick={() => onActionClick?.("approve", d.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeter">
                        <IconButton
                          size="small"
                          sx={{ color: "#d32f2f" }}
                          onClick={() => onActionClick?.("reject", d.id)}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Chip
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                      />
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
