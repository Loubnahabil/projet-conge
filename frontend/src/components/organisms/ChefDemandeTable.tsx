import { useTranslation } from "react-i18next";
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
import { StatusChip } from "@/components/atoms/StatusChip";
import { TypeCongeChip } from "@/components/atoms/TypeCongeChip";
import { EmptyState } from "@/components/atoms/EmptyState";
import type { DemandeResponse } from "@/types/Demande.types";

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
  emptyMessage,
}: ChefDemandeTableProps) => {
  const { t } = useTranslation();
  const emptyMsg = emptyMessage ?? t("common.noData");
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
              {t("chef.fonctionnaire")}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>{t("chef.service")}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>{t("common.type")}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>{t("chef.dateDebut")}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>{t("chef.dateFin")}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>{t("chef.dureeJ")}</TableCell>
            {showActions ? (
              <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", pr: 4 }}>
                {t("common.actions")}
              </TableCell>
            ) : (
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>{t("common.status")}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} sx={{ py: 3 }}>
                <EmptyState message={emptyMsg} />
              </TableCell>
            </TableRow>
          ) : (
            data.map((d) => {
              return (
                <TableRow key={d.id} sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {d.userNomComplet}
                  </TableCell>
                  <TableCell sx={{ color: "#475569" }}>{d.userServiceNom}</TableCell>
                  <TableCell>
                    <TypeCongeChip typeConge={d.typeConge} />
                  </TableCell>
                  <TableCell>{d.dateDebut}</TableCell>
                  <TableCell>{d.dateFin}</TableCell>
                  <TableCell>{d.duree}</TableCell>

                  {showActions ? (
                    <TableCell align="right" sx={{ pr: 2 }}>
                      <Tooltip title={t("demandeTable.voirDetailsShort")}>
                        <IconButton
                          size="small"
                          sx={{ color: "#2563eb", mr: 1 }}
                          onClick={() => onViewClick?.(d)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("chef.approuver")}>
                        <IconButton
                          size="small"
                          sx={{ color: "#16a34a", mr: 1 }}
                          onClick={() => onActionClick?.("approve", d.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("chef.rejeter")}>
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
                      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                        <StatusChip statut={d.statut} />
                        <Tooltip title={t("demandeTable.voirDetailsShort")}>
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
