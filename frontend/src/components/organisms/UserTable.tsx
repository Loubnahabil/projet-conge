import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Typography,
  Box,
  TablePagination,
} from "@mui/material";
import { Edit, Person } from "@mui/icons-material";
import type { RootState } from "@/store";
import type { AppDispatch } from "@/store";
import {
  setPagination,
  fetchUsersListThunk,
  toggleUserStatusThunk,
  openPopup,
} from "@/store/slices/userSlice";
import type { UserResponse } from "@/types/user.types";

export const UserTable: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // ⚡ Pulling states straight out of your users slice state
  const {
    list: users,
    totalElements,
    page,
    rowsPerPage,
    searchQuery,
  } = useSelector((state: RootState) => state.users);

  const handleChangePage = (_event: unknown, newPage: number) => {
    dispatch(setPagination({ page: newPage, rowsPerPage }));
    dispatch(fetchUsersListThunk());
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updatedSize = parseInt(event.target.value, 10);
    dispatch(setPagination({ page: 0, rowsPerPage: updatedSize }));
    dispatch(fetchUsersListThunk());
  };

  // ⚡ Filter the original Redux list locally using your search term
  const filteredUsers = users.filter((user: UserResponse) => {
    if (!searchQuery) return true; // Show everyone if search is blank

    const term = searchQuery.toLowerCase().trim();
    return (
      user.nom.toLowerCase().includes(term) ||
      user.prenom.toLowerCase().includes(term) ||
      user.ppr.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              {t("userTable.ppr")}
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              {t("userTable.fonctionnaire")}
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              {t("userTable.structure")}
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              {t("userTable.grade")}
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
              {t("userTable.actif")}
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: "600", color: "#475569", pr: 4 }}
            >
              {t("common.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                sx={{ py: 6, color: "#64748b" }}
              >
                <Person sx={{ fontSize: "2.5rem", mb: 1, color: "#94a3b8" }} />
                <Typography variant="body2">
                  {t("userTable.noUsers")}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user: UserResponse) => (
              <TableRow
                key={user.id}
                sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
              >
                <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
                  {user.ppr}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "600", color: "#1e293b" }}
                    >
                      {user.nom.toUpperCase()} {user.prenom}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {user.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#334155" }}>
                      {user.directionNom}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", display: "block" }}
                    >
                      {user.divisionNom} &bull; {user.serviceNom}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#475569" }}>{user.grade}</TableCell>
                <TableCell>
                  <Switch
                    size="small"
                    checked={user.enabled}
                    onChange={() => dispatch(toggleUserStatusThunk(user.id))}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  <IconButton
                    size="small"
                    onClick={() => dispatch(openPopup({ mode: "edit", user }))}
                    sx={{ color: "#1976d2" }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t("common.linesPerPage")}
      />
    </TableContainer>
  );
};
