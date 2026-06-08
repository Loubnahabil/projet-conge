import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
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
import HistoryIcon from "@mui/icons-material/History";
import { StatusChip } from "@/components/atoms/StatusChip";
import type { RootState } from "@/store";

// ⚡ Using standard MUI color variants exactly like your Demande configuration setup
const STATUT_CONFIG: Record<
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
> = {
  BROUILLON: { label: "Brouillon", color: "default" },
  SOUMISE: { label: "Soumise", color: "warning" },
  VISEE_CHEF: { label: "Visée chef", color: "info" },
  SIGNEE_DIRECTEUR: { label: "Signée", color: "success" },
  REJETEE_CHEF: { label: "Rejetée chef", color: "error" },
  REJETEE_DIRECTEUR: { label: "Rejetée direction", color: "error" },
  ANNULEE: { label: "Annulée", color: "default" },
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  FONCTIONNAIRE: "Fonctionnaire",
  CHEF_HIERARCHIE: "Chef hiérarchique",
  SIGNATAIRE: "Signataire",
};

const ALL_STATUTS = Object.keys(STATUT_CONFIG);

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
    const q = search.toLowerCase().trim();
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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
                {STATUT_CONFIG[s]?.label ?? s}
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
            bgcolor: "#fff",
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
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "#64748b" }}
                >
                  <HistoryIcon
                    sx={{ fontSize: "2.5rem", mb: 1, color: "#94a3b8" }}
                  />
                  <Typography variant="body2">
                    Aucune entrée trouvée dans le journal d'audit.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((entry) => {
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
                      {formatDate(entry.dateAction)}
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
                      {ROLE_LABEL[entry.acteurRole] ?? entry.acteurRole}
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
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
        />
      </TableContainer>
    </Box>
  );
};
