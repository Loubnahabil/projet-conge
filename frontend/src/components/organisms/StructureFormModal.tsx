import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@/components/molecules/FormInput";
import { AppButton } from "@/components/atoms/AppButton";
import { structureValidationSchema } from "@/validations/structureSchema";

interface FormInputs {
  nom: string;
}

interface StructureFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  type: "direction" | "division" | "service";
  currentText: string;
  actionLoading: boolean;
  onClose: () => void;
  onSave: (nom: string) => Promise<void>;
}

export const StructureFormModal: React.FC<StructureFormModalProps> = ({
  isOpen,
  mode,
  type,
  currentText,
  actionLoading,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(structureValidationSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit") {
        setValue("nom", currentText);
      } else {
        reset();
      }
    }
  }, [isOpen, mode, currentText, setValue, reset]);

  const submitHandler = (data: FormInputs) => {
    onSave(data.nom);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !actionLoading && onClose()}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#fff",
            color: "#333",
            width: "400px",
            borderRadius: "12px",
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#1e293b" }}>
        {mode === "create"
          ? `${t("structure.addTitle")} ${type}`
          : `${t("structure.editTitle")} ${type}`}
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate sx={{ mt: 1 }}>
          <FormInput
            label={`${t("structure.nomField")} ${type} *`}
            registration={register("nom")}
            error={!!errors.nom}
            helperText={errors.nom?.message}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <AppButton
          text={t("common.cancel")}
          variant="outlined"
          onClick={onClose}
          disabled={actionLoading}
        />
        <AppButton text={t("common.save")} onClick={handleSubmit(submitHandler)} loading={actionLoading} />
      </DialogActions>
    </Dialog>
  );
};
