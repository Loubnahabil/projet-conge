import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { YearSelector } from "@/components/molecules/YearSelector";
import { QuotaTable } from "@/components/organisms/QuotaTable";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchQuotasPage,
  clearFeedback,
  setQuotaPage,
  setQuotaRowsPerPage,
} from "@/store/slices/quotaSlice";
import { useTranslation } from "react-i18next";

export default function QuotaManagementPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { feedback, page, rowsPerPage, totalElements } = useSelector(
    (state: RootState) => state.quotas,
  );

  useEffect(() => {
    dispatch(
      fetchQuotasPage({
        year: selectedYear,
        page,
        size: rowsPerPage,
      }),
    );
  }, [selectedYear, page, rowsPerPage, dispatch]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        dispatch(clearFeedback());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback, dispatch]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    dispatch(setQuotaPage(0));
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    dispatch(setQuotaPage(newPage));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    dispatch(setQuotaRowsPerPage(parseInt(event.target.value, 10)));
  };

  return (
    <Box sx={{ p: 4 }}>
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

        <YearSelector value={selectedYear} onChange={handleYearChange} />
      </Box>

      {feedback && (
        <Alert severity={feedback.type} sx={{ mb: 3, borderRadius: 2 }}>
          {feedback.text}
        </Alert>
      )}

      <QuotaTable
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
}
