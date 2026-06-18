import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Edit, Delete, EventNote } from "@mui/icons-material";
import type { RootState, AppDispatch } from "@/store";
import { deleteHolidayThunk } from "@/store/slices/jourFerieSlice";
import type { JourFerieResponse } from "@/types/jourFerie.types";

interface JourFerieTableProps {
  onEdit: (item: JourFerieResponse) => void;
}

export const JourFerieTable: React.FC<JourFerieTableProps> = ({ onEdit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { list: holidays } = useSelector((state: RootState) => state.jourFerie);

  // States to manage the custom confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<number | null>(null);

  const handleOpenConfirm = (id: number) => {
    setSelectedHolidayId(id);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setSelectedHolidayId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedHolidayId !== null) {
      dispatch(deleteHolidayThunk(selectedHolidayId));
    }
    handleCloseConfirm();
  };

  const formatDateString = (rawDate: string) => {
    if (!rawDate) return "";
    const [year, month, day] = rawDate.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                {t("jourFerie.date")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                {t("jourFerie.libelle")}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", pr: 3 }}>
                {t("common.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6, color: "#64748b" }}>
                  <EventNote sx={{ fontSize: "2.5rem", mb: 1, color: "#94a3b8" }} />
                  <Typography variant="body2">{t("jourFerie.noData")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((item: JourFerieResponse) => (
                <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}>
                  <TableCell sx={{ fontWeight: "500", color: "#1e293b" }}>
                    {formatDateString(item.date)}
                  </TableCell>
                  <TableCell sx={{ color: "#334155" }}>{item.libelle}</TableCell>
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(item)}
                      sx={{ color: "#1976d2", mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenConfirm(item.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              p: 1,
              width: "100%",
              maxWidth: "440px",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "700", color: "#1e293b", pb: 1 }}>
          {t("jourFerie.confirmDeleteTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#475569", fontSize: "0.95rem" }}>
            {t("jourFerie.confirmDeleteMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 1, gap: 1 }}>
          <Button
            onClick={handleCloseConfirm}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: "#cbd5e1",
              color: "#64748b",
              textTransform: "none",
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            sx={{
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
