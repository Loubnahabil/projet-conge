import { useTranslation } from "react-i18next";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/store/slices/authSlice";
import authApi from "@/api/authApi";
import type { RootState, AppDispatch } from "@/store";

export const Navbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Backend logout failed", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#1976d2" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold" }}>
          {t("navbar.title")}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user && (
            <Typography variant="body1" sx={{ fontWeight: "500", color: "#fff" }}>
              {`${t("navbar.bonjour")} ${user.prenom} ${user.nom}`}
            </Typography>
          )}

          <Tooltip title={t("navbar.monProfil")}>
            <IconButton onClick={() => navigate("/profile")} sx={{ color: "#fff" }}>
              <AccountCircle />
            </IconButton>
          </Tooltip>

          <Button
            color="inherit"
            onClick={handleLogout}
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.6)",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            {t("navbar.deconnexion")}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
