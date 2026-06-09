import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

import { AppButton } from "@/components/atoms/AppButton";
import { SearchBar } from "@/components/molecules/SearchBar";
import { UserTable } from "@/components/organisms/UserTable";
import { UserFormModal } from "@/components/organisms/UserFormModal";
import { useExportUsers } from "@/hooks/useExportUsers"; // 👈 Ajout du hook d'export
import type { RootState, AppDispatch } from "@/store";
import {
  fetchUsersListThunk,
  setSearchQuery,
  openPopup,
} from "@/store/slices/userSlice";
import {
  fetchDirectionsThunk,
  fetchRolesThunk,
} from "@/store/slices/structureSlice";
import { useTranslation } from "react-i18next";

export const UserPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // ⚡ Récupération de globalLoading, searchQuery et list (users) depuis Redux
  const {
    globalLoading,
    searchQuery,
    list: users,
  } = useSelector((state: RootState) => state.users);

  // ⚡ Hook d'export — reçoit la liste des utilisateurs
  const { exportExcel, exportPDF } = useExportUsers(users);

  useEffect(() => {
    dispatch(fetchUsersListThunk());
    dispatch(fetchDirectionsThunk());
    dispatch(fetchRolesThunk());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  if (globalLoading) {
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

  return (
    <Box sx={{ p: 1, minHeight: "100vh", bgcolor: "transparent" }}>
      {/* Upper Structural Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "700", color: "#1e293b" }}>
          {t("userTable.title")}
        </Typography>

        {/* 📦 Groupe de boutons d'action (Export + Ajout) */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <AppButton
            text={t("userTable.exportExcel")}
            onClick={exportExcel}
            startIcon={<FileDownload />}
            variant="outlined"
            color="success"
          />
          <AppButton
            text={t("userTable.exportPdf")}
            onClick={exportPDF}
            startIcon={<FileDownload />}
            variant="outlined"
            color="error"
          />
          <AppButton
            text={t("userTable.addButton")}
            onClick={() => dispatch(openPopup({ mode: "create" }))}
          />
        </Box>
      </Box>

      {/* 🧪 Reusable Search Molecule */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <SearchBar
          placeholder={t("userTable.searchPlaceholder")}
          value={searchQuery}
          onChange={handleSearch}
        />
      </Box>

      {/* 🧬 Grid Collection Organism */}
      <UserTable />

      {/* 🧬 Action Popover Form Modal Organism */}
      <UserFormModal />
    </Box>
  );
};

export default UserPage;
