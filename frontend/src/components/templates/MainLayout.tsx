import { Box, CssBaseline, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/organisms/Navbar";
import { Sidebar } from "@/components/organisms/Sidebar";

export const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Navbar />

      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 3, minHeight: "100vh" }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
