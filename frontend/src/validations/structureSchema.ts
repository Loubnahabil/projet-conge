import * as yup from "yup";

interface StructureFormInputs {
  nom: string;
}

export const structureValidationSchema: yup.ObjectSchema<StructureFormInputs> =
  yup.object({
    nom: yup.string().required("Ce champ est obligatoire"),
  });
