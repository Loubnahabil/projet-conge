import * as yup from "yup";
import i18next from "i18next";

interface JourFerieFormInputs {
  date: string;
  libelle: string;
}

export const jourFerieValidationSchema: yup.ObjectSchema<JourFerieFormInputs> =
  yup.object({
    date: yup.string().required(() => i18next.t("validation.dateRequired")),
    libelle: yup.string().required(() => i18next.t("validation.libelleRequired")),
  });
