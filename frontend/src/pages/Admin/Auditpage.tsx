import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { LoadingSpinner } from "../../components/atoms/LoadingSpinner";
import { AuditTable } from "../../components/organisms/AuditTable";
import { fetchJournalAuditThunk } from "../../store/slices/auditSlice";
import type { RootState, AppDispatch } from "../../store";

export const AuditPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.audit);

  useEffect(() => {
    dispatch(fetchJournalAuditThunk());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Structural Header Area */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Journal d'Audit
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Historique complet de toutes les actions sur les demandes de congés
        </Typography>
      </Box>

      {/* 🔍 Isolated Audit Table Organism */}
      <AuditTable />
    </Box>
  );
};

export default AuditPage;
