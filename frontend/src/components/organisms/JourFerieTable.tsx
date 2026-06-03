import React from "react";
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
} from "@mui/material";
import { Edit, Delete, EventNote } from "@mui/icons-material";
import type { RootState, AppDispatch } from "../../store";
import {
  deleteHolidayThunk,
  openHolidayPopup,
} from "../../store/slices/jourFerieSlice";
import type { JourFerieResponseDTO } from "../../types/jourFerie.types";

export const JourFerieTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: holidays } = useSelector((state: RootState) => state.jourFerie);

  const handleDelete = (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce jour férié ?")) {
      dispatch(deleteHolidayThunk(id));
    }
  };

  const formatDateString = (rawDate: string) => {
    if (!rawDate) return "";
    const [year, month, day] = rawDate.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
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
              Date
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              Désignation / Libellé
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: "600", color: "#475569", pr: 4 }}
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
                <TableCell sx={{ color: "#334155" }}>{item.libelle}</TableCell>
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
                    onClick={() => handleDelete(item.id)}
                    sx={{ color: "#d32f2f" }}
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
  );
};
