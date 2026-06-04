import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";
import { AppButton } from "../../components/atoms/AppButton";
import { SearchBar } from "../../components/molecules/SearchBar";
import { UserTable } from "../../components/organisms/UserTable";
import { UserFormModal } from "../../components/organisms/UserFormModal";
import type { RootState, AppDispatch } from "../../store";
import {
  fetchUsersListThunk,
  setSearchQuery,
  openPopup,
} from "../../store/slices/userSlice";
import { fetchStructureDependenciesThunk } from "../../store/slices/structureSlice";

export const UserPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { globalLoading, searchQuery } = useSelector(
    (state: RootState) => state.users,
  );

  useEffect(() => {
    dispatch(fetchUsersListThunk());
    dispatch(fetchStructureDependenciesThunk());
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
        <CircularProgress />
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
          Gestion des Fonctionnaires
        </Typography>
        <AppButton
          text="+ Ajouter un Fonctionnaire"
          onClick={() => dispatch(openPopup({ mode: "create" }))}
        />
      </Box>

      {/* 🧪 Reusable Search Molecule */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <SearchBar
          placeholder="Rechercher par PPR, Nom, Email..."
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
