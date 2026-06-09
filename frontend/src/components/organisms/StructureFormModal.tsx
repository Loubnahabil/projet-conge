import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@/components/molecules/FormInput";
import { AppButton } from "@/components/atoms/AppButton";
import type { RootState, AppDispatch } from "@/store";
import {
  closeStructurePopup,
  saveStructureNodeThunk,
} from "@/store/slices/structureSlice";
import { structureValidationSchema } from "@/validations/structureSchema";

interface FormInputs {
  nom: string;
}

export const StructureFormModal: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { actionLoading, popup } = useSelector(
    (state: RootState) => state.structure,
  );

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
    if (popup.isOpen) {
      if (popup.mode === "edit") {
        setValue("nom", popup.currentText);
      } else {
        reset();
      }
    }
  }, [popup.isOpen, popup.mode, popup.currentText, setValue, reset]);

  const onSave = (data: FormInputs) => {
    dispatch(saveStructureNodeThunk({ nom: data.nom }));
  };

  return (
    <Dialog
      open={popup.isOpen}
      onClose={() => !actionLoading && dispatch(closeStructurePopup())}
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
      <DialogTitle
        sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#1e293b" }}
      >
        {popup.mode === "create"
          ? `${t("structure.addTitle")} ${popup.type}`
          : `${t("structure.editTitle")} ${popup.type}`}
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSave)}
          noValidate
          sx={{ mt: 1 }}
        >
          <FormInput
            label={`${t("structure.nomField")} ${popup.type} *`}
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
          onClick={() => dispatch(closeStructurePopup())}
          disabled={actionLoading}
        />
        <AppButton
          text={t("common.save")}
          onClick={handleSubmit(onSave)}
          loading={actionLoading}
        />
      </DialogActions>
    </Dialog>
  );
};
