import * as yup from "yup";
import i18next from "i18next";

interface DemandeFormInputs {
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  interimId: string;
}

export const demandeValidationSchema: yup.ObjectSchema<DemandeFormInputs> = yup.object({
  dateDebut: yup.string().required(() => i18next.t("validation.dateDebutRequired")),
  dateFin: yup
    .string()
    .required(() => i18next.t("validation.dateFinRequired"))
    .test(
      "date-order",
      () => i18next.t("validation.dateFinApresDebut"),
      function (val) {
        const { dateDebut } = this.parent;
        if (!dateDebut || !val) return true;
        return new Date(val) >= new Date(dateDebut);
      },
    ),
  typeConge: yup.string().required(() => i18next.t("validation.typeCongeRequired")),
  interimId: yup.string().required(() => i18next.t("validation.interimaireRequired")),
});
