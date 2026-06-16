import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import type { RootState } from "@/store";

interface QuotaTableProps {
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const QuotaTable: React.FC<QuotaTableProps> = ({
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useTranslation();

  const { list: quotas, globalLoading } = useSelector((state: RootState) => state.quotas);

  if (globalLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
              {t("quota.nomComplet")}
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
              {t("quota.grade")}
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
              {t("quota.joursAlloues")}
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
              {t("quota.joursUtilises")}
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
              {t("quota.joursRestants")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quotas.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.userNomComplet}</TableCell>
              <TableCell>{row.grade}</TableCell>
              <TableCell>{row.joursAlloues}</TableCell>
              <TableCell>{row.joursUtilises}</TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                  {row.joursRestants} {t("quota.jrs")}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage={t("common.linesPerPage")}
      />
    </TableContainer>
  );
};
