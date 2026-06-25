import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
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
import {
  fetchDirections,
  fetchDivisionsByDirection,
  fetchServicesByDivision,
} from "@/store/slices/structureSlice";
import { clearError, fetchRoles } from "@/store/slices/userSlice";
import { userValidationSchema } from "@/validations/userSchema";
import type { UserRequest, UserResponse } from "@/types/user.types";

function populateEditForm(
  setValue: ReturnType<typeof useForm<UserFormInputs>>["setValue"],
  targetUser: UserResponse,
  roles: { id: number; name: string }[],
) {
  setValue("nom", targetUser.nom);
  setValue("prenom", targetUser.prenom);
  setValue("email", targetUser.email);
  setValue("ppr", targetUser.ppr);
  setValue("grade", targetUser.grade);
  setValue("dateDebutFonction", targetUser.dateDebutFonction);
  setValue("directionId", targetUser.directionId);
  setValue("divisionId", targetUser.divisionId);
  setValue("serviceId", targetUser.serviceId);

  const matchingRole = roles.find((r) => r.name === targetUser.role);
  if (matchingRole) {
    setValue("roleId", matchingRole.id);
  }
}

interface UserFormInputs {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  ppr: string;
  grade: string;
  dateDebutFonction: string;
  directionId: number;
  divisionId: number;
  serviceId: number;
  roleId: number;
}

interface UserFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  targetUser: UserResponse | null;
  actionLoading: boolean;
  onClose: () => void;
  onSave: (data: UserRequest) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  mode,
  targetUser,
  actionLoading,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { directions, currentDivisions, currentServices } = useSelector(
    (state: RootState) => state.structure,
  );
  const { roles, error: formError } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    if (directions.length === 0) dispatch(fetchDirections());
    if (roles.length === 0) dispatch(fetchRoles());
  }, [dispatch, directions.length, roles.length]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: yupResolver(userValidationSchema),
    context: { isCreate: mode === "create" },
  });

  const watchedDirectionId = watch("directionId");
  const watchedDivisionId = watch("divisionId");

  const prevDirectionId = useRef<number | undefined>(undefined);
  const prevDivisionId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      prevDirectionId.current = undefined;
      prevDivisionId.current = undefined;
      reset();
      dispatch(clearError());
      if (mode === "edit" && targetUser) {
        populateEditForm(setValue, targetUser, roles);
      }
    }
  }, [isOpen, mode, targetUser, reset, setValue, roles, dispatch]);

  useEffect(() => {
    if (!watchedDirectionId) return;
    dispatch(fetchDivisionsByDirection(watchedDirectionId));
  }, [watchedDirectionId, dispatch]);

  useEffect(() => {
    if (watchedDirectionId && prevDirectionId.current !== undefined) {
      setValue("divisionId", 0);
      setValue("serviceId", 0);
    }
    prevDirectionId.current = watchedDirectionId;
  }, [watchedDirectionId, setValue]);

  useEffect(() => {
    if (!watchedDivisionId) return;
    dispatch(fetchServicesByDivision(watchedDivisionId));
  }, [watchedDivisionId, dispatch]);

  useEffect(() => {
    if (watchedDivisionId && prevDivisionId.current !== undefined) {
      setValue("serviceId", 0);
    }
    prevDivisionId.current = watchedDivisionId;
  }, [watchedDivisionId, setValue]);

  const submitHandler = (data: UserFormInputs) => {
    const payload: UserRequest = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      ppr: data.ppr,
      grade: data.grade,
      dateDebutFonction: data.dateDebutFonction,
      serviceId: data.serviceId,
      roleId: data.roleId,
      ...(mode === "create" ? { password: data.password } : {}),
    };
    onSave(payload);
  };

  const formatRoleLabel = (name: string) => {
    return name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
        {mode === "create" ? t("userForm.titleCreate") : t("userForm.titleEdit")}
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormInput
              label={t("userForm.nom")}
              registration={register("nom")}
              error={!!errors.nom}
              helperText={errors.nom?.message}
            />
            <FormInput
              label={t("userForm.prenom")}
              registration={register("prenom")}
              error={!!errors.prenom}
              helperText={errors.prenom?.message}
            />
          </Box>

          <FormInput
            label={t("userForm.email")}
            type="email"
            registration={register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          {mode === "create" && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormInput
                label={t("userForm.password")}
                type="password"
                registration={register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <FormInput
                label={t("userForm.confirmPassword")}
                type="password"
                registration={register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormInput
              label={t("userForm.ppr")}
              registration={register("ppr")}
              error={!!errors.ppr}
              helperText={errors.ppr?.message}
            />
            <FormInput
              label={t("userForm.grade")}
              registration={register("grade")}
              error={!!errors.grade}
              helperText={errors.grade?.message}
            />
          </Box>

          <Typography variant="caption" sx={{ color: "#475569", mb: -1, fontWeight: "500" }}>
            {t("userForm.dateDebutFonction")}
          </Typography>
          <FormInput
            label=""
            type="date"
            registration={register("dateDebutFonction")}
            error={!!errors.dateDebutFonction}
            helperText={errors.dateDebutFonction?.message}
          />

          <Controller
            name="directionId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                required
                label={t("userForm.direction")}
                size="small"
                slotProps={{ select: { displayEmpty: true } }}
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              >
                {directions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nom}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="divisionId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                required
                label={t("userForm.division")}
                size="small"
                slotProps={{ select: { displayEmpty: true } }}
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                disabled={!watchedDirectionId}
                fullWidth
              >
                {currentDivisions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nom}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="serviceId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                required
                label={t("userForm.service")}
                size="small"
                slotProps={{ select: { displayEmpty: true } }}
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                disabled={!watchedDivisionId}
                fullWidth
              >
                {currentServices.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nom}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="roleId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                required
                label={t("userForm.role")}
                size="small"
                slotProps={{ select: { displayEmpty: true } }}
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {formatRoleLabel(r.name)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          {formError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {formError}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <AppButton
          text={t("common.cancel")}
          variant="outlined"
          onClick={onClose}
          disabled={actionLoading}
        />
        <AppButton
          text={t("userForm.save")}
          onClick={handleSubmit(submitHandler)}
          loading={actionLoading}
        />
      </DialogActions>
    </Dialog>
  );
};
