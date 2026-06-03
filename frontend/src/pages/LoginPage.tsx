import { Box, Paper, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginThunk } from "../store/slices/authSlice";
import { LoginForm } from "../components/organisms/LoginForm"; // Importing our complete organism!
import type { AppDispatch, RootState } from "../store/index";
import type { LoginRequest } from "../types/auth.types";

const LoginPage = () => {
  // Grab the global loading/error state from our Redux store
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // This handles sending the valid credentials to Redux
  const handleLoginSubmit = async (data: LoginRequest) => {
    const result = await dispatch(loginThunk(data));

    // If the server validates the user successfully, push them to the internal system
    if (loginThunk.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    // This outer Box centers our login box vertically and horizontally on the screen
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Paper gives us that nice, clean white card look with shadows */}
      <Paper
        elevation={3}
        sx={{ padding: 4, width: 400, borderRadius: "12px" }}
      >
        {/* Title text */}
        <Typography
          sx={{
            fontWeight: "bold",
            mb: 3,
            textAlign: "center",
            fontSize: "1.5rem",
          }}
        >
          Gestion des Congés
        </Typography>

        {/* We place our finished Organism inside the card layout */}
        <LoginForm
          onSubmit={handleLoginSubmit}
          loading={loading}
          error={error}
        />
      </Paper>
    </Box>
  );
};

export default LoginPage;
