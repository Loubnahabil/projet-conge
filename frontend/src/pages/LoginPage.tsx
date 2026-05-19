import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { loginThunk } from "../store/slices/authSlice";
import type { AppDispatch, RootState } from "../store/index";
import type { LoginRequest } from "../types/auth.types";
import { loginSchema } from "../validations/auth.validation";

const LoginPage = () => {
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // useForm manages the form
  // register → connects input fields to Hook Form
  // handleSubmit → runs Yup validation then calls onSubmit
  // errors → validation error messages from Yup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });

  // only called if Yup validation passes
  const onSubmit = async (data: LoginRequest) => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
          Gestion des Congés
        </Typography>

        {/* shows backend error (wrong password etc) */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* noValidate disables browser validation
                    Yup handles everything */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Se connecter"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
