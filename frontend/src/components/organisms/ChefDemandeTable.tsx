import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import { CheckCircle, Cancel, Visibility } from "@mui/icons-material";
import { StatusChip } from "../atoms/StatusChip";
import { TypeCongeChip } from "../atoms/TypeCongeChip";
import { EmptyState } from "../atoms/EmptyState";
import type { DemandeResponse } from "../../types/Demande.types";

interface ChefDemandeTableProps {
  data: DemandeResponse[];
  showActions?: boolean;
  onActionClick?: (mode: "approve" | "reject", id: number) => void;
  onViewClick?: (demande: DemandeResponse) => void;
  emptyMessage?: string;
}

export const ChefDemandeTable = ({
  data,
  showActions = false,
  onActionClick,
  onViewClick,
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
              <TableCell colSpan={7} sx={{ py: 3 }}>
                <EmptyState message={emptyMessage} />
              </TableCell>
            </TableRow>
          ) : (
            data.map((d) => {
              return (
                <TableRow key={d.id} sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {d.userNomComplet}
                  </TableCell>
                  <TableCell sx={{ color: "#475569" }}>
                    {d.userServiceNom}
                  </TableCell>
                  <TableCell>
                    <TypeCongeChip typeConge={d.typeConge} />
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
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center", gap: 1 }}
                      >
                        <StatusChip statut={d.statut} />
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
