import { Box, CssBaseline, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Navbar } from "../organisms/Navbar";
import { Sidebar } from "../organisms/Sidebar";

export const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top Header */}
      <Navbar />

      {/* Side Menu */}
      <Sidebar />

      {/* Central App Pages Wrapper */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 3, minHeight: "100vh" }}
      >
        <Toolbar />

        {/* Children routes load dynamically here */}
        <Outlet />
      </Box>
    </Box>
  );
};
