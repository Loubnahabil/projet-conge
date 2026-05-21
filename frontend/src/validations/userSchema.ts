import * as yup from "yup";

// Interface copy placed here for type safety mapping reference
interface UserFormInputs {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  ppr: string;
  grade: string;
  dateDebutFonction: string;
  directionId: string;
  divisionId: string;
  serviceId: string;
  roleId: string;
}

// Added <UserFormInputs> here to align TypeScript types perfectly
export const userValidationSchema: yup.ObjectSchema<UserFormInputs> =
  yup.object({
    nom: yup.string().required("Le nom est obligatoire"),
    prenom: yup.string().required("Le prénom est obligatoire"),
    email: yup
      .string()
      .required("L'email est obligatoire")
      .email("Email invalide"),
    ppr: yup.string().required("Le PPR est obligatoire"),
    grade: yup.string().required("Le grade est obligatoire"),
    dateDebutFonction: yup
      .string()
      .required("La date de début de fonction est obligatoire"),
    directionId: yup.string().required("La direction est obligatoire"),
    divisionId: yup.string().required("La division est obligatoire"),
    serviceId: yup.string().required("Le service est obligatoire"),
    roleId: yup.string().required("Le rôle système est obligatoire"),

    password: yup.string().when("$isCreate", {
      is: true,
      then: (schema) =>
        schema
          .required("Le mot de passe temporaire est obligatoire")
          .min(6, "Minimum 6 caractères"),
      otherwise: (schema) => schema.notRequired(),
    }),

    confirmPassword: yup.string().when("$isCreate", {
      is: true,
      then: (schema) =>
        schema
          .required("La confirmation du mot de passe est obligatoire")
          .oneOf(
            [yup.ref("password")],
            "Les mots de passe ne correspondent pas",
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
