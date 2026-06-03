import * as yup from "yup";

interface JourFerieFormInputs {
  date: string;
  libelle: string;
}

export const jourFerieValidationSchema: yup.ObjectSchema<JourFerieFormInputs> =
  yup.object({
    date: yup.string().required("La date est obligatoire"),
    libelle: yup.string().required("Le libellé du jour férié est obligatoire"),
  });
