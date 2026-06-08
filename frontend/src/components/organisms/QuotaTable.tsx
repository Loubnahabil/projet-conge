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
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import type { RootState, AppDispatch } from "@/store";
import { updateQuotaThunk } from "@/store/slices/quotaSlice";
import type { ExtendedQuota } from "@/store/slices/quotaSlice";

export const QuotaTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 1. Extract database arrays and load states directly from global Redux
  const {
    list: quotas,
    globalLoading,
    actionLoading,
  } = useSelector((state: RootState) => state.quotas);

  // 2. Local isolated state handles for tracking inline cell modification row items
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editAlloues, setEditAlloues] = useState<number>(30);
  const [editUtilises, setEditUtilises] = useState<number>(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const startEditingRow = (row: ExtendedQuota) => {
    setEditingRowId(row.id);
    setEditAlloues(row.joursAlloues);
    setEditUtilises(row.joursUtilises);
    setLocalError(null);
  };

  const handleSaveInline = async (id: number) => {
    // Basic inline guard boundary validation checks
    if (editAlloues < 0 || editAlloues > 90) {
      setLocalError("Les jours alloués doivent être compris entre 0 et 90.");
      return;
    }
    if (editUtilises < 0) {
      setLocalError("Les jours utilisés ne peuvent pas être négatifs.");
      return;
    }
    if (editAlloues < editUtilises) {
      setLocalError(
        "Attention: Les jours alloués sont inférieurs aux jours utilisés.",
      );
    }

    setLocalError(null);

    // Dispatching directly to our secure central update handler action!
    try {
      await dispatch(
        updateQuotaThunk({
          id,
          joursAlloues: editAlloues,
          joursUtilises: editUtilises,
        }),
      ).unwrap();
      setEditingRowId(null);
    } catch {
      // Error is caught and surfaced smoothly via global slice feedback
    }
  };

  if (globalLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {localError && (
        <Typography
          color="error"
          variant="body2"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          {localError}
        </Typography>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
                Nom Complet
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
                Grade
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
                Jours Alloués
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
                Jours Utilisés
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
                Jours Restants
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#1a237e" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotas.map((row) => {
              const isEditing = editingRowId === row.id;

              return (
                <TableRow key={row.id} hover>
                  <TableCell>{row.userNomComplet}</TableCell>
                  <TableCell>{row.grade}</TableCell>

                  {/* Allowed Column */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        variant="outlined"
                        value={editAlloues}
                        disabled={actionLoading}
                        onChange={(e) => setEditAlloues(Number(e.target.value))}
                        slotProps={{ htmlInput: { min: 0, max: 90 } }}
                        sx={{ width: 90 }}
                      />
                    ) : (
                      row.joursAlloues
                    )}
                  </TableCell>

                  {/* Utilized Column */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        variant="outlined"
                        value={editUtilises}
                        disabled={actionLoading}
                        onChange={(e) =>
                          setEditUtilises(Number(e.target.value))
                        }
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ width: 90 }}
                      />
                    ) : (
                      row.joursUtilises
                    )}
                  </TableCell>

                  {/* Remaining Column (Dynamic runtime calculation vs precomputed tracking) */}
                  <TableCell>
                    {isEditing ? (
                      <Typography sx={{ fontWeight: "bold", color: "#757575" }}>
                        {editAlloues - editUtilises} jrs (calculé)
                      </Typography>
                    ) : (
                      <Typography sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                        {row.joursRestants} jrs
                      </Typography>
                    )}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell>
                    {isEditing ? (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          color="success"
                          disabled={actionLoading}
                          onClick={() => handleSaveInline(row.id)}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          disabled={actionLoading}
                          onClick={() => setEditingRowId(null)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton
                        color="primary"
                        onClick={() => startEditingRow(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
