import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const DRAWER_WIDTH = 240;

interface MenuItem {
  text: string;
  path: string;
  roles: string[] | "all";
}

const menuItems: MenuItem[] = [
  // ── Admin Dashboard ────────────────────────────────────────────────────────
  { text: "Tableau de Bord", path: "/dashboard", roles: ["ADMIN"] },

  // ── Fonctionnaire Roles ────────────────────────────────────────────────────
  { text: "Tableau de Bord", path: "/fonctionnaire/dashboard", roles: ["FONCTIONNAIRE"] },
  { text: "Mes Demandes", path: "/mes-demandes", roles: ["FONCTIONNAIRE"] },

  // ── Chef roles ────────────────────────────────────────────────────────────
  {
    text: "Tableau de Bord",
    path: "/chef/demandes",
    roles: ["CHEF_HIERARCHIE", "CHEF_SERVICE", "CHEF_DIVISION", "DIRECTEUR"],
  },

  // ── Signataire ────────────────────────────────────────────────────────────
  {
    text: "Tableau de Bord",
    path: "/signataire/demandes",
    roles: ["SIGNATAIRE"],
  },

  // ── Admin Management Links ────────────────────────────────────────────────
  {
    text: "Structure organisationnelle",
    path: "/admin/structure",
    roles: ["ADMIN"],
  },
  { text: "Jours Fériés", path: "/admin/jours-feries", roles: ["ADMIN"] },
  {
    text: "Gestion des Fonctionnaires",
    path: "/admin/fonctionnaires",
    roles: ["ADMIN"],
  },
  { text: "Gestion des Quotas", path: "/admin/quotas", roles: ["ADMIN"] },
  { text: "Journal d'Audit", path: "/admin/audit", roles: ["ADMIN"] },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector((state: RootState) => state.auth.user?.role);

  const visibleItems = menuItems.filter(
    (item) => item.roles === "all" || (role && item.roles.includes(role)),
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "#fff",
          borderRight: "1px solid #e0e0e0",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", mt: 2 }}>
        <List>
          {visibleItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isSelected}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "rgba(25, 118, 210, 0.08)",
                      color: "#1976d2",
                      "&:hover": { bgcolor: "rgba(25, 118, 210, 0.12)" },
                    },
                    color: "#555",
                    mx: 1,
                    borderRadius: "4px",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: isSelected ? "600" : "400",
                          fontSize: "0.95rem",
                        }}
                      >
                        {item.text}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};
