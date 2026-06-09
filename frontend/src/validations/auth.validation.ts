import * as yup from "yup";
import i18next from "i18next";

// validation rules for login form
// used in LoginPage with React Hook Form
export const loginSchema = yup.object({
  email: yup.string().required(() => i18next.t("validation.authEmailRequired")).email(() => i18next.t("validation.authEmailInvalid")),
  password: yup
    .string()
    .required(() => i18next.t("validation.authPasswordRequired"))
    .min(6, () => i18next.t("validation.authPasswordMin")),
});
