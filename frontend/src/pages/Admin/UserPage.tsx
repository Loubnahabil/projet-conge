import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

import { AppButton } from "@/components/atoms/AppButton";
import { SearchBar } from "@/components/molecules/SearchBar";
import { UserTable } from "@/components/organisms/UserTable";
import { UserFormModal } from "@/components/organisms/UserFormModal";
import { useExportUsers } from "@/utils/useExportUsers";
import type { RootState, AppDispatch } from "@/store";
import { fetchUsersListThunk, setSearchQuery, saveUserThunk, fetchRolesThunk } from "@/store/slices/userSlice";
import { fetchDirectionsThunk } from "@/store/slices/structureSlice";
import type { UserResponse, UserRequest } from "@/types/user.types";
import { useTranslation } from "react-i18next";

export const UserPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    globalLoading,
    searchQuery,
    list: users,
    actionLoading,
  } = useSelector((state: RootState) => state.users);

  const { exportExcel, exportPDF } = useExportUsers(users);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    dispatch(fetchUsersListThunk());
    dispatch(fetchDirectionsThunk());
    dispatch(fetchRolesThunk());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleOpenCreate = () => {
    setPopupMode("create");
    setEditingUser(null);
    setPopupOpen(true);
  };

  const handleOpenEdit = (user: UserResponse) => {
    setPopupMode("edit");
    setEditingUser(user);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setEditingUser(null);
  };

  const handleSave = async (data: UserRequest) => {
    const result = await dispatch(saveUserThunk({ payload: data, id: editingUser?.id }));
    if (saveUserThunk.fulfilled.match(result)) {
      handleClosePopup();
    }
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
          <AppButton text={t("userTable.addButton")} onClick={handleOpenCreate} />
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <SearchBar
          placeholder={t("userTable.searchPlaceholder")}
          value={searchQuery}
          onChange={handleSearch}
        />
      </Box>

      <UserTable onEditUser={handleOpenEdit} />

      <UserFormModal
        isOpen={popupOpen}
        mode={popupMode}
        targetUser={editingUser}
        actionLoading={actionLoading}
        onClose={handleClosePopup}
        onSave={handleSave}
      />
    </Box>
  );
};

export default UserPage;
