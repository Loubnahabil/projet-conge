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
import type { RootState } from "../../store"; // adjust path if different

const DRAWER_WIDTH = 240;

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector((state: RootState) => state.auth.user?.role);
  console.log("ROLE FROM REDUX:", role);

  const isAdmin = role === "ADMIN";

  const menuItems = [
    // visible to everyone logged in
    { text: "Tableau de Bord", path: "/dashboard", adminOnly: false },
    // admin only
    {
      text: "Structure organisationnelle",
      path: "/admin/structure",
      adminOnly: true,
    },
    { text: "Jours Fériés", path: "/admin/jours-feries", adminOnly: true },
    {
      text: "Gestion des Fonctionnaires",
      path: "/admin/fonctionnaires",
      adminOnly: true,
    },
    // Added Quota Management Link Here 👇
    {
      text: "Gestion des Quotas",
      path: "/admin/quotas",
      adminOnly: true,
    },
  ];

  // filter out admin items if user is not admin
  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

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
