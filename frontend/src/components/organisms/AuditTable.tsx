import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { StatusChip } from "@/components/atoms/StatusChip";
import type { RootState, AppDispatch } from "@/store";
import {
  setAuditPage,
  setAuditRowsPerPage,
} from "@/store/slices/auditSlice";
import { ROLE_TKEY } from "@/constants/constants";
import { formatDateFR } from "@/utils/dateUtils";

export const AuditTable = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { entries, page, rowsPerPage, totalElements } = useSelector(
    (state: RootState) => state.audit,
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    dispatch(setAuditPage(newPage));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    dispatch(setAuditRowsPerPage(parseInt(event.target.value, 10)));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper
          sx={{
            px: 2,
            py: 1,
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 1,
            boxShadow: "none",
            bgcolor: "#fff",
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {t("audit.total")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "#0f172a" }}
          >
            {totalElements}{" "}
            {t(
              totalElements !== 1
                ? "common.entries_plural"
                : "common.entries",
            )}
          </Typography>
        </Paper>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Date / Heure
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Utilisateur
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Rôle
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Demande #
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Action
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Commentaire
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "#64748b" }}
                >
                  <HistoryIcon
                    sx={{ fontSize: "2.5rem", mb: 1, color: "#94a3b8" }}
                  />
                  <Typography variant="body2">{t("audit.noData")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => {
                return (
                  <TableRow
                    key={entry.id}
                    sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
                  >
                    <TableCell
                      sx={{
                        color: "#475569",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      {formatDateFR(entry.dateAction)}
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "600", color: "#1e293b" }}
                        >
                          {entry.acteurNom.toUpperCase()} {entry.acteurPrenom}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {entry.acteurEmail}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ color: "#334155" }}>
                      {t(ROLE_TKEY[entry.acteurRole] ?? entry.acteurRole)}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#1976d2",
                        fontFamily: "monospace",
                      }}
                    >
                      #{entry.demandeId}
                    </TableCell>

                    <TableCell>
                      <StatusChip statut={entry.statutAction} />
                    </TableCell>

                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.8rem",
                          color: entry.commentaire ? "#334155" : "#cbd5e1",
                          fontStyle: entry.commentaire ? "normal" : "italic",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.commentaire ?? "—"}
                      </Typography>
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
