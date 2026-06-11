import { useTranslation } from "react-i18next";
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
import type { RootState } from "@/store";

const DRAWER_WIDTH = 240;

interface MenuItem {
  labelKey: string;
  path: string;
  roles: string[] | "all";
}

const menuItems: MenuItem[] = [
  { labelKey: "dashboard", path: "/dashboard", roles: ["ADMIN"] },
  { labelKey: "dashboard", path: "/fonctionnaire/dashboard", roles: ["FONCTIONNAIRE"] },
  { labelKey: "myRequests", path: "/mes-demandes", roles: ["FONCTIONNAIRE"] },
  {
    labelKey: "dashboard",
    path: "/chef/demandes",
    roles: ["CHEF_HIERARCHIE", "CHEF_SERVICE", "CHEF_DIVISION", "DIRECTEUR"],
  },
  {
    labelKey: "dashboard",
    path: "/signataire/demandes",
    roles: ["SIGNATAIRE"],
  },
  {
    labelKey: "structure",
    path: "/admin/structure",
    roles: ["ADMIN"],
  },
  { labelKey: "holidays", path: "/admin/jours-feries", roles: ["ADMIN"] },
  {
    labelKey: "users",
    path: "/admin/fonctionnaires",
    roles: ["ADMIN"],
  },
  { labelKey: "quotas", path: "/admin/quotas", roles: ["ADMIN"] },
  { labelKey: "audit", path: "/admin/audit", roles: ["ADMIN"] },
];

export const Sidebar = () => {
  const { t } = useTranslation();
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
              <ListItem key={item.labelKey + item.path} disablePadding>
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
                        {t(`sidebar.${item.labelKey}`)}
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
