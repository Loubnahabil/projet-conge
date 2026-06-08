import React from "react";
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
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AppButton } from "@/components/atoms/AppButton";
import { FormInput } from "@/components/molecules/FormInput";
import { demandeValidationSchema } from "@/validations/demandeSchema";
import type { DemandeResponse } from "@/types/Demande.types";
import type { UserResponseDTO } from "@/types/user.types";
import { FileUploadField } from "@/components/molecules/FileUploadField";

interface FormInputs {
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  interimId: string;
}

interface DemandeFormProps {
  editingDemande: DemandeResponse | null;
  colleagues: UserResponseDTO[];
  actionLoading: boolean;
  onCancel: () => void;
  onSaveWorkflow: (data: FormInputs, submitInstantly: boolean) => void;
  selectedFile: File | null;
  fileError: string | null;
  onFileChange: (file: File | null) => void;
}

const MOROCCAN_HOLIDAYS = [
  "2026-01-11",
  "2026-05-01",
  "2026-07-30",
  "2026-08-14",
  "2026-08-20",
  "2026-08-21",
  "2026-11-06",
  "2026-11-18",
];

export const DemandeForm = ({
  editingDemande,
  colleagues,
  actionLoading,
  onCancel,
  onSaveWorkflow,
  fileError,
  onFileChange,
}: DemandeFormProps) => {
  const existingFileName = editingDemande?.piecesJustificatives?.[0]?.nomFichier ?? null;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(demandeValidationSchema),
    defaultValues: {
      typeConge: editingDemande?.typeConge || "",
      interimId: editingDemande?.interimId?.toString() || "",
      dateDebut: editingDemande?.dateDebut || "",
      dateFin: editingDemande?.dateFin || "",
    },
  });

  const watchTypeConge = useWatch({ control, name: "typeConge" });
  const watchDateDebut = useWatch({ control, name: "dateDebut" });
  const watchDateFin = useWatch({ control, name: "dateFin" });

  // Compute live local durations
  let calculatedDuree = 0;
  if (watchDateDebut && watchDateFin) {
    const start = new Date(watchDateDebut);
    const end = new Date(watchDateFin);
    if (start <= end) {
      let days = 0;
      const current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        const dateStr = current.toISOString().split("T")[0];
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = MOROCCAN_HOLIDAYS.includes(dateStr);
        if (!isWeekend && !isHoliday) days++;
        current.setDate(current.getDate() + 1);
      }
      calculatedDuree = days;
    }
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <IconButton onClick={onCancel} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          {editingDemande
            ? `Modifier la Demande N #${editingDemande.id}`
            : "Nouvelle Demande de Congé"}
        </Typography>
      </Stack>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, pl: 5 }}>
        Saisissez vos dates d'absence. Les week-ends et jours fériés nationaux
        sont automatiquement exclus du décompte final.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Date de la Demande"
            value={new Date().toLocaleDateString("fr-FR")}
            disabled
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Type de congé *"
            size="small"
            fullWidth
            {...register("typeConge")}
            error={!!errors.typeConge}
            helperText={errors.typeConge?.message}
          >
            <MenuItem value="ANNUEL">Congé Annuel</MenuItem>
            <MenuItem value="MALADIE">Congé Maladie</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormInput
            label="Date de début *"
            type="date"
            registration={register("dateDebut")}
            error={!!errors.dateDebut}
            helperText={errors.dateDebut?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormInput
            label="Date de fin *"
            type="date"
            registration={register("dateFin")}
            error={!!errors.dateFin}
            helperText={errors.dateFin?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Durée calculée"
            value={`${calculatedDuree} jours`}
            size="small"
            disabled
            fullWidth
            slotProps={{ input: { style: { fontWeight: "bold" } } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            label="Intérimaire (Collègues du même service) *"
            size="small"
            fullWidth
            {...register("interimId")}
            error={!!errors.interimId}
            helperText={errors.interimId?.message}
          >
            {colleagues.map((u) => (
              <MenuItem key={u.id} value={u.id.toString()}>
                {u.nom} {u.prenom}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#475569", mb: 1 }}
          >
            Pièces Justificatives{" "}
            {watchTypeConge === "MALADIE" && (
              <span style={{ color: "#ef4444" }}>
                * (obligatoire pour congé maladie)
              </span>
            )}
          </Typography>

          <FileUploadField error={fileError} existingFileName={existingFileName} onChange={onFileChange} />
        </Grid>
      </Grid>

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 5, justifyContent: "flex-end" }}
      >
        <AppButton
          text="Annuler"
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
          Enregistrer Brouillon
        </Button>
        <AppButton
          text="Soumettre la Demande"
          onClick={handleSubmit((data) => onSaveWorkflow(data, true))}
          loading={actionLoading}
        />
      </Stack>
    </Box>
  );
};
