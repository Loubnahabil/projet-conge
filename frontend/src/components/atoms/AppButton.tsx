import { Button, CircularProgress } from "@mui/material";

interface AppButtonProps {
  text: string;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  variant?: "contained" | "outlined" | "text";
  fullWidth?: boolean;
  onClick?: () => void;
}

export const AppButton = ({
  text,
  type = "button",
  loading = false,
  disabled = false,
  variant = "contained",
  fullWidth = false,
  onClick,
}: AppButtonProps) => {
  return (
    <Button
      type={type}
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : text}
    </Button>
  );
};
