import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { RootState } from "../../store";

const STATUT_COLOR: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  BROUILLON: { bg: "#f1f5f9", color: "#64748b", label: "Brouillon" },
  SOUMISE: { bg: "#fef3c7", color: "#d97706", label: "Soumise" },
  VISEE_CHEF: { bg: "#dbeafe", color: "#2563eb", label: "Visée chef" },
  SIGNEE_DIRECTEUR: { bg: "#d1fae5", color: "#059669", label: "Signée" },
  REJETEE_CHEF: { bg: "#fee2e2", color: "#dc2626", label: "Rejetée chef" },
  REJETEE_DIRECTEUR: {
    bg: "#fee2e2",
    color: "#dc2626",
    label: "Rejetée direction",
  },
  ANNULEE: { bg: "#f3f4f6", color: "#6b7280", label: "Annulée" },
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  FONCTIONNAIRE: "Fonctionnaire",
  CHEF_HIERARCHIE: "Chef hiérarchique",
  SIGNATAIRE: "Signataire",
};

const ALL_STATUTS = Object.keys(STATUT_COLOR);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-MA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" })
  );
};

export const AuditTable = () => {
  const { entries } = useSelector((state: RootState) => state.audit);

  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((e) => {
      const matchSearch =
        !q ||
        e.acteurNom.toLowerCase().includes(q) ||
        e.acteurPrenom.toLowerCase().includes(q) ||
        e.acteurEmail.toLowerCase().includes(q) ||
        String(e.demandeId).includes(q) ||
        (e.commentaire ?? "").toLowerCase().includes(q);
      const matchStatut =
        statutFilter === "ALL" || e.statutAction === statutFilter;
      return matchSearch && matchStatut;
    });
  }, [entries, search, statutFilter]);

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box>
      {/* Filters Control Block */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Rechercher par nom, email, demande…"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1, minWidth: 260, bgcolor: "#fff", borderRadius: "8px" }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl
          size="small"
          sx={{ minWidth: 200, bgcolor: "#fff", borderRadius: "8px" }}
        >
          <InputLabel>Statut</InputLabel>
          <Select
            value={statutFilter}
            label="Statut"
            onChange={(e) => {
              setStatutFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tous les statuts</MenuItem>
            {ALL_STATUTS.map((s) => (
              <MenuItem key={s} value={s}>
                {STATUT_COLOR[s]?.label ?? s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Total :
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "#0f172a" }}
          >
            {filtered.length} entrée{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Paper>
      </Box>

      {/* Main Data Layout */}
      <Paper
        sx={{
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {[
                  "Date / Heure",
                  "Utilisateur",
                  "Rôle",
                  "Demande #",
                  "Action",
                  "Commentaire",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#64748b",
                      borderBottom: "2px solid #e2e8f0",
                      py: 1.5,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 6, color: "#94a3b8" }}
                  >
                    Aucune entrée trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((entry) => {
                  const statut = STATUT_COLOR[entry.statutAction];
                  return (
                    <TableRow
                      key={entry.id}
                      sx={{
                        "&:hover": { bgcolor: "#f8fafc" },
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.78rem",
                            color: "#475569",
                            fontFamily: "monospace",
                          }}
                        >
                          {formatDate(entry.dateAction)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontSize: "0.85rem",
                          }}
                        >
                          {entry.acteurPrenom} {entry.acteurNom}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {entry.acteurEmail}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.78rem", color: "#64748b" }}
                        >
                          {ROLE_LABEL[entry.acteurRole] ?? entry.acteurRole}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: "#3b82f6",
                            fontSize: "0.82rem",
                          }}
                        >
                          #{entry.demandeId}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={statut?.label ?? entry.statutAction}
                          size="small"
                          sx={{
                            bgcolor: statut?.bg ?? "#f1f5f9",
                            color: statut?.color ?? "#64748b",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            height: 22,
                            border: "none",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 1.5, maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.78rem",
                            color: entry.commentaire ? "#475569" : "#cbd5e1",
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
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} sur ${count}`
          }
          sx={{ borderTop: "1px solid #f1f5f9" }}
        />
      </Paper>
    </Box>
  );
};
