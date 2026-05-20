import { TextField } from "@mui/material";
import type { UseFormRegisterReturn } from "react-hook-form";

// 1. We define what information this field needs to do its job
interface FormInputProps {
  label: string; // e.g., "Email" or "Mot de passe"
  type?: string; // e.g., "email" or "password"
  error?: boolean; // true if there is a validation error
  helperText?: string; // the error message text (e.g., "Email requis")
  registration: UseFormRegisterReturn; // connects it to React Hook Form
}

export const FormInput = ({
  label,
  type = "text",
  error,
  helperText,
  registration,
}: FormInputProps) => {
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      margin="normal"
      error={error}
      helperText={helperText}
      {...registration} // This spreads the form tracking hooks into the input box
    />
  );
};
