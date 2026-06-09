import React from "react";
import { useTranslation } from "react-i18next";
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
import { Cancel, UploadFile, Download, Visibility } from "@mui/icons-material";
import { StatusChip } from "@/components/atoms/StatusChip";
import { TypeCongeChip } from "@/components/atoms/TypeCongeChip";
import { EmptyState } from "@/components/atoms/EmptyState";
import type { DemandeResponse } from "@/types/Demande.types";

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
  emptyMessage,
}: SignataireDemandeTableProps) => {
  const { t } = useTranslation();
  const defaultEmpty = emptyMessage ?? t("common.noData");
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
              {t("signataire.fonctionnaire")}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("signataire.service")}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("common.type")}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("signataire.dateDebut")}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("signataire.dateFin")}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
              {t("signataire.dureeJ")}
            </TableCell>

            {showActions ? (
              <TableCell
                align="right"
                sx={{ fontWeight: 600, color: "#475569", pr: 4 }}
              >
                {t("common.actions")}
              </TableCell>
            ) : (
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                {t("common.status")}
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} sx={{ py: 3 }}>
                <EmptyState message={defaultEmpty} />
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
                      <Tooltip title={t("signataire.voirDetails")}>
                        <IconButton
                          size="small"
                          sx={{ color: "#2563eb", mr: 1 }}
                          onClick={() => onViewClick?.(d)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t("signataire.signerDeposer")}>
                        <IconButton
                          size="small"
                          sx={{ color: "#2563eb", mr: 1 }}
                          onClick={() => onSignClick?.(d.id)}
                        >
                          <UploadFile fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t("signataire.telechargerPdf")}>
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

                      <Tooltip title={t("signataire.rejeter")}>
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
                        <StatusChip statut={d.statut} />
                        <Tooltip title={t("signataire.voirDetails")}>
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
