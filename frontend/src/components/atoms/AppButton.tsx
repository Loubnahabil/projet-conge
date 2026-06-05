import { Button, CircularProgress } from "@mui/material";
import type { ReactNode } from "react";

interface AppButtonProps {
  text: string;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  fullWidth?: boolean;
  onClick?: () => void;
  startIcon?: ReactNode; // 👈 ajout
}

export const AppButton = ({
  text,
  type = "button",
  loading = false,
  disabled = false,
  variant = "contained",
  color = "primary", // 👈 ajout
  fullWidth = false,
  onClick,
  startIcon, // 👈 ajout
}: AppButtonProps) => {
  return (
    <Button
      type={type}
      variant={variant}
      color={color} // 👈 ajout
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={!loading ? startIcon : undefined} // 👈 ajout (masqué pendant loading)
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : text}
    </Button>
  );
};
