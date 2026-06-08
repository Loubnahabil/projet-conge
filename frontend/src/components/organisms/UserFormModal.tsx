import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  MenuItem,
  TextField,
  Alert,
  Typography,
} from "@mui/material";
import { FormInput } from "@/components/molecules/FormInput";
import { AppButton } from "@/components/atoms/AppButton";
import type { RootState, AppDispatch } from "@/store";
import { closePopup, saveUserThunk } from "@/store/slices/userSlice";
import { userValidationSchema } from "@/validations/userSchema";
import type { UserRequestDTO } from "@/types/user.types";

interface UserFormInputs {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  ppr: string;
  grade: string;
  dateDebutFonction: string;
  directionId: string;
  divisionId: string;
  serviceId: string;
  roleId: string;
}

export const UserFormModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, mode, targetUser } = useSelector(
    (state: RootState) => state.users.popup,
  );
  const actionLoading = useSelector(
    (state: RootState) => state.users.actionLoading,
  );
  const { directions, divisions, services, roles } = useSelector(
    (state: RootState) => state.structure,
  );
  const formError = useSelector((state: RootState) => state.users.error);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: yupResolver(userValidationSchema),
    context: { isCreate: mode === "create" },
  });

  const watchedDirectionId = watch("directionId");
  const watchedDivisionId = watch("divisionId");

  useEffect(() => {
    if (isOpen) {
      reset();
      if (mode === "edit" && targetUser) {
        setValue("nom", targetUser.nom);
        setValue("prenom", targetUser.prenom);
        setValue("email", targetUser.email);
        setValue("ppr", targetUser.ppr);
        setValue("grade", targetUser.grade);
        setValue("dateDebutFonction", targetUser.dateDebutFonction);
        setValue("directionId", targetUser.directionId?.toString() || "");
        setValue("divisionId", targetUser.divisionId?.toString() || "");
        setValue("serviceId", targetUser.serviceId?.toString() || "");
        console.log(targetUser.serviceId);

        const matchingRole = roles.find((r) => r.name === targetUser.role);
        setValue("roleId", matchingRole ? matchingRole.id.toString() : "");
      }
    }
  }, [isOpen, mode, targetUser, reset, setValue, roles]);

  const onSave = (data: UserFormInputs) => {
    const payload: UserRequestDTO = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      ppr: data.ppr,
      grade: data.grade,
      dateDebutFonction: data.dateDebutFonction,
      serviceId: Number(data.serviceId),
      roleId: Number(data.roleId),
      ...(mode === "create" ? { password: data.password } : {}),
    };

    dispatch(saveUserThunk({ payload, id: targetUser?.id }));
  };

  const formatRoleLabel = (name: string) => {
    return name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => dispatch(closePopup())}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
        {mode === "create"
          ? "Ajouter un Nouveau Fonctionnaire"
          : "Modifier Profil Fonctionnaire"}
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormInput
              label="Nom *"
              registration={register("nom")}
              error={!!errors.nom}
              helperText={errors.nom?.message}
            />
            <FormInput
              label="Prénom *"
              registration={register("prenom")}
              error={!!errors.prenom}
              helperText={errors.prenom?.message}
            />
          </Box>

          <FormInput
            label="Email Professionnel *"
            type="email"
            registration={register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          {mode === "create" && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormInput
                label="Mot de passe temporaire *"
                type="password"
                registration={register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <FormInput
                label="Confirmer le mot de passe *"
                type="password"
                registration={register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormInput
              label="Numéro PPR *"
              registration={register("ppr")}
              error={!!errors.ppr}
              helperText={errors.ppr?.message}
            />
            <FormInput
              label="Grade / Échelle *"
              registration={register("grade")}
              error={!!errors.grade}
              helperText={errors.grade?.message}
            />
          </Box>

          <Typography
            variant="caption"
            sx={{ color: "#475569", mb: -1, fontWeight: "500" }}
          >
            Date de début de fonction *
          </Typography>
          <FormInput
            label=""
            type="date"
            registration={register("dateDebutFonction")}
            error={!!errors.dateDebutFonction}
            helperText={errors.dateDebutFonction?.message}
          />

          <TextField
            select
            required
            label="Direction"
            size="small"
            slotProps={{ select: { displayEmpty: true } }}
            {...register("directionId")}
            error={!!errors.directionId}
            helperText={errors.directionId?.message}
            fullWidth
          >
            {directions.map((d) => (
              <MenuItem key={d.id} value={d.id.toString()}>
                {d.nom}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            required
            label="Division"
            size="small"
            slotProps={{ select: { displayEmpty: true } }}
            {...register("divisionId")}
            error={!!errors.divisionId}
            helperText={errors.divisionId?.message}
            disabled={!watchedDirectionId}
            fullWidth
          >
            {divisions
              .filter((div) => div.directionId === Number(watchedDirectionId))
              .map((d) => (
                <MenuItem key={d.id} value={d.id.toString()}>
                  {d.nom}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            select
            required
            label="Service d'affectation"
            size="small"
            slotProps={{ select: { displayEmpty: true } }}
            {...register("serviceId")}
            error={!!errors.serviceId}
            helperText={errors.serviceId?.message}
            disabled={!watchedDivisionId}
            fullWidth
          >
            {services
              .filter((ser) => ser.divisionId === Number(watchedDivisionId))
              .map((s) => (
                <MenuItem key={s.id} value={s.id.toString()}>
                  {s.nom}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            select
            required
            label="Rôle Système"
            size="small"
            slotProps={{ select: { displayEmpty: true } }}
            {...register("roleId")}
            error={!!errors.roleId}
            helperText={errors.roleId?.message}
            fullWidth
          >
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id.toString()}>
                {formatRoleLabel(r.name)}
              </MenuItem>
            ))}
          </TextField>
          {formError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {formError}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <AppButton
          text="Annuler"
          variant="outlined"
          onClick={() => dispatch(closePopup())}
          disabled={actionLoading}
        />
        <AppButton
          text="Enregistrer"
          onClick={handleSubmit(onSave)}
          loading={actionLoading}
        />
      </DialogActions>
    </Dialog>
  );
};
