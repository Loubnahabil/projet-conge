import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@/components/molecules/FormInput";
import { AppButton } from "@/components/atoms/AppButton";
import { jourFerieValidationSchema } from "@/validations/jourFerieSchema";
import type { JourFerieResponse } from "@/types/jourFerie.types";

interface FormInputs {
  date: string;
  libelle: string;
}

interface JourFerieFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  targetItem: JourFerieResponse | null;
  actionLoading: boolean;
  onClose: () => void;
  onSave: (data: { date: string; libelle: string }) => Promise<void>;
}

export const JourFerieFormModal: React.FC<JourFerieFormModalProps> = ({
  isOpen,
  mode,
  targetItem,
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
    resolver: yupResolver(jourFerieValidationSchema),
  });

  useEffect(() => {
    if (isOpen && mode === "edit" && targetItem) {
      setValue("date", targetItem.date);
      setValue("libelle", targetItem.libelle);
    } else {
      reset();
    }
  }, [isOpen, mode, targetItem, setValue, reset]);

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
        {mode === "create" ? t("jourFerie.addTitle") : t("jourFerie.editTitle")}
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSave)}
          noValidate
          sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormInput
            label=""
            type="date"
            registration={register("date")}
            error={!!errors.date}
            helperText={errors.date?.message}
          />
          <FormInput
            label={t("jourFerie.libelleField")}
            registration={register("libelle")}
            error={!!errors.libelle}
            helperText={errors.libelle?.message}
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
        <AppButton text={t("common.save")} onClick={handleSubmit(onSave)} loading={actionLoading} />
      </DialogActions>
    </Dialog>
  );
};
