import React, { useState } from "react";
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
import {
  deleteHolidayThunk,
  openHolidayPopup,
} from "@/store/slices/jourFerieSlice";
import type { JourFerieResponseDTO } from "@/types/jourFerie.types";

export const JourFerieTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: holidays } = useSelector((state: RootState) => state.jourFerie);

  // States to manage the custom confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<number | null>(
    null,
  );

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
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                Libellé du jour férié
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, color: "#475569", pr: 3 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 6, color: "#64748b" }}
                >
                  <EventNote
                    sx={{ fontSize: "2.5rem", mb: 1, color: "#94a3b8" }}
                  />
                  <Typography variant="body2">
                    Aucun jour férié enregistré pour le moment.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((item: JourFerieResponseDTO) => (
                <TableRow
                  key={item.id}
                  sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
                >
                  <TableCell sx={{ fontWeight: "500", color: "#1e293b" }}>
                    {formatDateString(item.date)}
                  </TableCell>
                  <TableCell sx={{ color: "#334155" }}>
                    {item.libelle}
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        dispatch(openHolidayPopup({ mode: "edit", item }))
                      }
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
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#475569", fontSize: "0.95rem" }}>
            Voulez-vous vraiment supprimer ce jour férié ? Cette action est
            irréversible et mettra à jour les calculs de congés.
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
            Annuler
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
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
