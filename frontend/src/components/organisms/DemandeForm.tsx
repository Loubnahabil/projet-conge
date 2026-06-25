import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Stack,
  Divider,
  IconButton,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useForm, useWatch, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AppButton } from "@/components/atoms/AppButton";
import { FormInput } from "@/components/molecules/FormInput";
import { demandeValidationSchema } from "@/validations/demandeSchema";
import type { DemandeResponse } from "@/types/Demande.types";
import type { UserResponse } from "@/types/user.types";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { useTranslation } from "react-i18next";
import { calculerJoursOuvrables } from "@/services/leave.service";
import { fetchHolidays } from "@/store/slices/jourFerieSlice";
import type { AppDispatch, RootState } from "@/store";

interface FormInputs {
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  interimId: string;
}

interface DemandeFormProps {
  editing: DemandeResponse | null;
  colleagues: UserResponse[];
  actionLoading: boolean;
  onCancel: () => void;
  onSaveWorkflow: (data: FormInputs, submitInstantly: boolean) => void;
  selectedFile: File | null;
  fileError: string | null;
  onFileChange: (file: File | null) => void;
}

export const DemandeForm = ({
  editing,
  colleagues,
  actionLoading,
  onCancel,
  onSaveWorkflow,
  fileError,
  onFileChange,
}: DemandeFormProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const holidays = useSelector((state: RootState) =>
    state.jourFerie.list.map((h) => h.date),
  );

  useEffect(() => {
    if (holidays.length === 0) {
      dispatch(fetchHolidays());
    }
  }, [dispatch, holidays.length]);

  const existingFileName = editing?.piecesJustificatives?.[0]?.nomFichier ?? null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(demandeValidationSchema),
    defaultValues: {
      typeConge: editing?.typeConge || "",
      interimId: editing?.interimId?.toString() || "",
      dateDebut: editing?.dateDebut || "",
      dateFin: editing?.dateFin || "",
    },
  });

  const watchTypeConge = useWatch({ control, name: "typeConge" });
  const watchDateDebut = useWatch({ control, name: "dateDebut" });
  const watchDateFin = useWatch({ control, name: "dateFin" });

  const calculatedDuree =
    watchDateDebut && watchDateFin
      ? calculerJoursOuvrables(watchDateDebut, watchDateFin, holidays)
      : 0;

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <IconButton onClick={onCancel} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          {editing
            ? `${t("demandeForm.titleEdit")} #${editing.id}`
            : t("demandeForm.titleCreate")}
        </Typography>
      </Stack>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, pl: 5 }}>
        {t("demandeForm.description")}
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("demandeForm.dateDemande")}
            value={new Date().toLocaleDateString("fr-FR")}
            disabled
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="typeConge"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label={t("demandeForm.typeConge")}
                size="small"
                fullWidth
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="ANNUEL">{t("leaveType.congeAnnuel")}</MenuItem>
                <MenuItem value="MALADIE">{t("leaveType.congeMaladie")}</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormInput
            label={t("demandeForm.dateDebut")}
            type="date"
            registration={register("dateDebut")}
            error={!!errors.dateDebut}
            helperText={errors.dateDebut?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormInput
            label={t("demandeForm.dateFin")}
            type="date"
            registration={register("dateFin")}
            error={!!errors.dateFin}
            helperText={errors.dateFin?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label={t("demandeForm.dureeCalculee")}
            value={`${calculatedDuree} ${t("demandeTable.jours")}`}
            size="small"
            disabled
            fullWidth
            slotProps={{ input: { style: { fontWeight: "bold" } } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="interimId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label={t("demandeForm.interimaire")}
                size="small"
                fullWidth
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {colleagues.map((u) => (
                  <MenuItem key={u.id} value={u.id.toString()}>
                    {u.nom} {u.prenom}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569", mb: 1 }}>
            {t("demandeForm.piecesJustificatives")}{" "}
            {watchTypeConge === "MALADIE" && (
              <span style={{ color: "#ef4444" }}>{t("demandeForm.maladieObligatoire")}</span>
            )}
          </Typography>

          <FileUploadField
            error={fileError}
            existingFileName={existingFileName}
            onChange={onFileChange}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 5, justifyContent: "flex-end" }}>
        <AppButton
          text={t("common.cancel")}
          variant="outlined"
          onClick={onCancel}
          disabled={actionLoading}
        />
        <Button
          variant="contained"
          sx={{ bgcolor: "#64748b", "&:hover": { bgcolor: "#475569" }, px: 3 }}
          onClick={handleSubmit((data) => onSaveWorkflow(data, false))}
          disabled={actionLoading}
        >
          {t("demandeForm.saveDraft")}
        </Button>
        <AppButton
          text={t("demandeForm.submitDemande")}
          onClick={handleSubmit((data) => onSaveWorkflow(data, true))}
          loading={actionLoading}
        />
      </Stack>
    </Box>
  );
};
