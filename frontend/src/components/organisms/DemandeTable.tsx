import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import { Edit, Visibility, Cancel, Send } from "@mui/icons-material";
import { StatusChip } from "@/components/atoms/StatusChip";
import { EmptyState } from "@/components/atoms/EmptyState";
import type { DemandeResponse } from "@/types/Demande.types";

interface DemandeTableProps {
  demandes: DemandeResponse[];
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
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onOpenCreate: () => void;
  onOpenDetail: (d: DemandeResponse) => void;
  onOpenEdit: (d: DemandeResponse) => void;
  onDirectSubmit: (d: DemandeResponse) => void;
  onCancelClick: (id: number) => void;
}

export const DemandeTable = ({
  demandes,
  statutConfig,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onOpenCreate,
  onOpenDetail,
  onOpenEdit,
  onDirectSubmit,
  onCancelClick,
}: DemandeTableProps) => {
  const { t } = useTranslation();

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t("demandeTable.title")}
        </Typography>
        <Button variant="contained" onClick={onOpenCreate}>
          {t("demandeTable.newButton")}
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t("demandeTable.id")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("demandeTable.type")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("demandeTable.debut")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("demandeTable.fin")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("demandeTable.duree")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("common.status")}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>
                {t("common.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {demandes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 3 }}>
                  <EmptyState message={t("demandeTable.noDemandes")} />
                </TableCell>
              </TableRow>
            ) : (
              demandes.map((d) => {
                const isBrouillon = d.statut === "BROUILLON";
                const isSoumise = d.statut === "SOUMISE";
                const canEdit = isBrouillon || isSoumise;

                return (
                  <TableRow key={d.id} hover>
                    <TableCell>#{d.id}</TableCell>
                    <TableCell>
                      {d.typeConge === "ANNUEL" ? t("leaveType.annuel") : t("leaveType.maladie")}
                    </TableCell>
                    <TableCell>{d.dateDebut}</TableCell>
                    <TableCell>{d.dateFin}</TableCell>
                    <TableCell>{d.duree} j</TableCell>
                    <TableCell>
                      <StatusChip statut={d.statut} />
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 2 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ justifyContent: "flex-end" }}
                      >
                        <Tooltip title={t("demandeTable.voirDetails")}>
                          <IconButton
                            color="info"
                            onClick={() => onOpenDetail(d)}
                            size="small"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {canEdit && (
                          <Tooltip title={t("demandeTable.modifier")}>
                            <IconButton
                              color="primary"
                              onClick={() => onOpenEdit(d)}
                              size="small"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {isBrouillon && (
                          <>
                            <Tooltip title={t("demandeTable.soumettre")}>
                              <IconButton
                                sx={{ color: "#16a34a" }}
                                onClick={() => onDirectSubmit(d)}
                                size="small"
                              >
                                <Send fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("demandeTable.annulerSupprimer")}>
                              <IconButton
                                color="error"
                                onClick={() => onCancelClick(d.id)}
                                size="small"
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {isSoumise && (
                          <Tooltip title={t("demandeTable.annulerDemande")}>
                            <IconButton
                              color="error"
                              onClick={() => onCancelClick(d.id)}
                              size="small"
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t("common.linesPerPage")}
        />
      </TableContainer>
    </Box>
  );
};
