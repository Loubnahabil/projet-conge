import * as yup from "yup";
import i18next from "i18next";

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
  directionId: number;
  divisionId: number;
  serviceId: number;
  roleId: number;
}

// Added <UserFormInputs> here to align TypeScript types perfectly
export const userValidationSchema: yup.ObjectSchema<UserFormInputs> = yup.object({
  nom: yup.string().required(() => i18next.t("validation.nomRequired")),
  prenom: yup.string().required(() => i18next.t("validation.prenomRequired")),
  email: yup
    .string()
    .required(() => i18next.t("validation.emailRequired"))
    .email(() => i18next.t("validation.emailInvalid")),
  ppr: yup.string().required(() => i18next.t("validation.pprRequired")),
  grade: yup.string().required(() => i18next.t("validation.gradeRequired")),
  dateDebutFonction: yup.string().required(() => i18next.t("validation.dateDebutFonctionRequired")),
  directionId: yup
    .number()
    .typeError(() => i18next.t("validation.directionTypeError"))
    .required(() => i18next.t("validation.directionRequired")),
  divisionId: yup
    .number()
    .typeError(() => i18next.t("validation.divisionTypeError"))
    .required(() => i18next.t("validation.divisionRequired")),
  serviceId: yup
    .number()
    .typeError(() => i18next.t("validation.serviceTypeError"))
    .required(() => i18next.t("validation.serviceRequired")),
  roleId: yup
    .number()
    .typeError(() => i18next.t("validation.roleTypeError"))
    .required(() => i18next.t("validation.roleRequired")),

  password: yup.string().when("$isCreate", {
    is: true,
    then: (schema) =>
      schema
        .required(() => i18next.t("validation.passwordRequired"))
        .min(6, () => i18next.t("validation.passwordMin")),
    otherwise: (schema) => schema.notRequired(),
  }),

  confirmPassword: yup.string().when("$isCreate", {
    is: true,
    then: (schema) =>
      schema
        .required(() => i18next.t("validation.confirmPasswordRequired"))
        .oneOf([yup.ref("password")], () => i18next.t("validation.passwordMismatch")),
    otherwise: (schema) => schema.notRequired(),
  }),
});
