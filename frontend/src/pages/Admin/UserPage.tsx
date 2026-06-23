import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography } from "@mui/material";
import { FileDownload } from "@mui/icons-material";

import { AppButton } from "@/components/atoms/AppButton";
import { SearchBar } from "@/components/molecules/SearchBar";
import { UserTable } from "@/components/organisms/UserTable";
import { UserFormModal } from "@/components/organisms/UserFormModal";
import { useExportUsers } from "@/utils/useExportUsers";
import type { RootState, AppDispatch } from "@/store";
import { setSearchQuery, saveUser } from "@/store/slices/userSlice";
import type { UserResponse, UserRequest } from "@/types/user.types";
import { useTranslation } from "react-i18next";

export const UserPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    searchQuery,
    list: users,
    actionLoading,
  } = useSelector((state: RootState) => state.users);

  const { exportExcel, exportPDF } = useExportUsers(users);

  const [view, setView] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<UserResponse | null>(null);

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const openCreate = () => { setView("create"); setEditing(null); };
  const openEdit = (user: UserResponse) => { setView("edit"); setEditing(user); };
  const close = () => setView("closed");

  const handleSave = async (data: UserRequest) => {
    const result = await dispatch(saveUser({ payload: data, id: editing?.id }));
    if (saveUser.fulfilled.match(result)) {
      close();
    }
  };

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
          <AppButton text={t("userTable.addButton")} onClick={openCreate} />
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <SearchBar
          placeholder={t("userTable.searchPlaceholder")}
          value={searchQuery}
          onChange={handleSearch}
        />
      </Box>

      <UserTable onEditUser={openEdit} />

      <UserFormModal
        isOpen={view !== "closed"}
        mode={view === "edit" ? "edit" : "create"}
        targetUser={editing}
        actionLoading={actionLoading}
        onClose={close}
        onSave={handleSave}
      />
    </Box>
  );
};

export default UserPage;
