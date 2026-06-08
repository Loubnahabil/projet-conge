import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/store/slices/authSlice";
import authApi from "@/api/authApi";
import type { RootState, AppDispatch } from "@/store";

export const Navbar = () => {
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
        {/* Left Side: App Title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          Gestion des Congés
        </Typography>

        {/* Right Side: Welcome message, Profile Icon, and Logout Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user && (
            <Typography
              variant="body1"
              sx={{ fontWeight: "500", color: "#fff" }}
            >
              Bonjour, {user.prenom} {user.nom}
            </Typography>
          )}

          {/* Profile Icon Button */}
          <Tooltip title="Mon profil">
            <IconButton
              onClick={() => navigate("/profile")}
              sx={{ color: "#fff" }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>

          {/* Logout Button */}
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
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
