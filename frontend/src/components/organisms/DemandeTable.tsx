import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import { Edit, Visibility, Cancel, Send } from "@mui/icons-material";
import { StatusChip } from "../atoms/StatusChip";
import { EmptyState } from "../atoms/EmptyState";
import type { DemandeResponse } from "../../types/Demande.types";

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
  onOpenCreate: () => void;
  onOpenDetail: (d: DemandeResponse) => void;
  onOpenEdit: (d: DemandeResponse) => void;
  onDirectSubmit: (d: DemandeResponse) => void;
  onCancelClick: (id: number) => void;
}

export const DemandeTable = ({
  demandes,
  statutConfig,
  onOpenCreate,
  onOpenDetail,
  onOpenEdit,
  onDirectSubmit,
  onCancelClick,
}: DemandeTableProps) => {
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
          Mes Demandes de Congé
        </Typography>
        <Button variant="contained" onClick={onOpenCreate}>
          Nouvelle Demande
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Début</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fin</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Durée</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {demandes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 3 }}>
                  <EmptyState message="Aucune demande trouvée." />
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
                      {d.typeConge === "ANNUEL" ? "Annuel" : "Maladie"}
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
                        <Tooltip title="Voir Détails">
                          <IconButton
                            color="info"
                            onClick={() => onOpenDetail(d)}
                            size="small"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {canEdit && (
                          <Tooltip title="Modifier">
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
                            <Tooltip title="Soumettre">
                              <IconButton
                                sx={{ color: "#16a34a" }}
                                onClick={() => onDirectSubmit(d)}
                                size="small"
                              >
                                <Send fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Annuler (Supprimer)">
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
                          <Tooltip title="Annuler la demande">
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
      </TableContainer>
    </Box>
  );
};
