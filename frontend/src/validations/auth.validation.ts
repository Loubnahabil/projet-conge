import * as yup from "yup";

// validation rules for login form
// used in LoginPage with React Hook Form
export const loginSchema = yup.object({
  email: yup.string().required("Email est obligatoire").email("Email invalide"),
  password: yup
    .string()
    .required("Mot de passe est obligatoire")
    .min(6, "Mot de passe doit contenir au moins 6 caractères"),
});
