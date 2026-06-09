import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { YearSelector } from "@/components/molecules/YearSelector";
import { QuotaTable } from "@/components/organisms/QuotaTable";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchQuotasMatrixThunk,
  clearFeedback,
} from "@/store/slices/quotaSlice";
import { useTranslation } from "react-i18next";

export default function QuotaManagementPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // 1. Local track state solely for the active structural year filter
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  // 2. Extract global slice notifications / messages
  const { feedback } = useSelector((state: RootState) => state.quotas);

  // 3. Re-trigger data compilation thunk whenever the year selection changes
  useEffect(() => {
    dispatch(fetchQuotasMatrixThunk(selectedYear));
  }, [selectedYear, dispatch]);

  // 4. Automatically clear success/error banners after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        dispatch(clearFeedback());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback, dispatch]);

  return (
    <Box sx={{ p: 4 }}>
      {/* Structural Page Header Container */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          {t("quota.title")}
        </Typography>

        {/* 🧪 Drop our completely isolated Year Filter Molecule */}
        <YearSelector value={selectedYear} onChange={setSelectedYear} />
      </Box>

      {/* Global State Notifications Layer */}
      {feedback && (
        <Alert severity={feedback.type} sx={{ mb: 3, borderRadius: 2 }}>
          {feedback.text}
        </Alert>
      )}

      {/* 🧬 Drop our heavy-lifting Table Organism */}
      <QuotaTable />
    </Box>
  );
}
