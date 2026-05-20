import { Box, Button, CircularProgress, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../molecules/FormInput"; // Importing our molecule!
import { loginSchema } from "../../validations/auth.validation";
import type { LoginRequest } from "../../types/auth.types";

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void; // What to do when validation passes
  loading: boolean; // Is Redux currently logging us in?
  error: string | null; // Error message from the backend database
}

export const LoginForm = ({ onSubmit, loading, error }: LoginFormProps) => {
  // We configure our form and Yup validation rules here
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });

  return (
    // Component="form" makes this Box act like an HTML form element
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* If the backend rejected our credentials, show a red alert bar */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Reusing our Molecule for the Email field */}
      <FormInput
        label="Email"
        type="email"
        registration={register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      {/* Reusing our Molecule for the Password field */}
      <FormInput
        label="Mot de passe"
        type="password"
        registration={register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      {/* Submit Button */}
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
  );
};
