import * as yup from "yup";

interface DemandeFormInputs {
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  interimId: string;
}

export const demandeValidationSchema: yup.ObjectSchema<DemandeFormInputs> =
  yup.object({
    dateDebut: yup.string().required("La date de début est obligatoire"),
    dateFin: yup
      .string()
      .required("La date de fin est obligatoire")
      .test(
        "date-order",
        "La date de fin doit être après la date de début",
        function (val) {
          const { dateDebut } = this.parent;
          if (!dateDebut || !val) return true;
          return new Date(val) >= new Date(dateDebut);
        },
      ),
    typeConge: yup.string().required("Le type de congé est obligatoire"),
    interimId: yup.string().required("L'intérimaire est obligatoire"),
  });
