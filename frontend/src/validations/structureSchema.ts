import * as yup from "yup";
import i18next from "i18next";

interface StructureFormInputs {
  nom: string;
}

export const structureValidationSchema: yup.ObjectSchema<StructureFormInputs> = yup.object({
  nom: yup.string().required(() => i18next.t("validation.fieldRequired")),
});
