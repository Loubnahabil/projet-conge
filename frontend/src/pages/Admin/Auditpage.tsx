import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { AuditTable } from "@/components/organisms/AuditTable";
import { fetchJournalAuditThunk } from "@/store/slices/auditSlice";
import type { RootState, AppDispatch } from "@/store";
import { useTranslation } from "react-i18next";

export const AuditPage = () => {
  const { t } = useTranslation();
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
          {t("audit.title")}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          {t("audit.description")}
        </Typography>
      </Box>

      {/* 🔍 Isolated Audit Table Organism */}
      <AuditTable />
    </Box>
  );
};

export default AuditPage;
