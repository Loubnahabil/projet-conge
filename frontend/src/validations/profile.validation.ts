import * as yup from "yup";
import i18next from "i18next";

export const profileSchema = yup.object({
  nom: yup.string().required(() => i18next.t("validation.nomRequired")),
  prenom: yup.string().required(() => i18next.t("validation.prenomRequired")),
  email: yup
    .string()
    .required(() => i18next.t("validation.emailRequired"))
    .email(() => i18next.t("validation.emailInvalid")),
  currentPassword: yup.string(),
  newPassword: yup.string().min(6, () => i18next.t("validation.passwordMin")),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], () => i18next.t("validation.passwordMismatch")),
});
