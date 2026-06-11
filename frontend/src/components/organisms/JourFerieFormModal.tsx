import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@/components/molecules/FormInput";
import { AppButton } from "@/components/atoms/AppButton";
import type { RootState, AppDispatch } from "@/store";
import {
  createHolidayThunk,
  updateHolidayThunk,
  closeHolidayPopup,
} from "@/store/slices/jourFerieSlice";
import { jourFerieValidationSchema } from "@/validations/jourFerieSchema";

interface FormInputs {
  date: string;
  libelle: string;
}

export const JourFerieFormModal: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { actionLoading, popup } = useSelector((state: RootState) => state.jourFerie);

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
    if (popup.isOpen && popup.mode === "edit" && popup.targetItem) {
      setValue("date", popup.targetItem.date);
      setValue("libelle", popup.targetItem.libelle);
    } else {
      reset();
    }
  }, [popup.isOpen, popup.mode, popup.targetItem, setValue, reset]);

  const onSave = async (data: FormInputs) => {
    if (popup.mode === "create") {
      dispatch(createHolidayThunk({ date: data.date, libelle: data.libelle }));
    } else if (popup.mode === "edit" && popup.targetItem) {
      dispatch(
        updateHolidayThunk({
          id: popup.targetItem.id,
          date: data.date,
          libelle: data.libelle,
        }),
      );
    }
  };

  return (
    <Dialog
      open={popup.isOpen}
      onClose={() => !actionLoading && dispatch(closeHolidayPopup())}
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
        {popup.mode === "create" ? t("jourFerie.addTitle") : t("jourFerie.editTitle")}
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
          onClick={() => dispatch(closeHolidayPopup())}
          disabled={actionLoading}
        />
        <AppButton text={t("common.save")} onClick={handleSubmit(onSave)} loading={actionLoading} />
      </DialogActions>
    </Dialog>
  );
};
