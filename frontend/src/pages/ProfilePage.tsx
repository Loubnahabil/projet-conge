import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Alert,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Grid,
} from "@mui/material";
import { Person, Lock, Badge, ArrowBack } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import type { RootState, AppDispatch } from "@/store";
import { userApi } from "@/api/userApi";
import { AppButton } from "@/components/atoms/AppButton";
import { logout } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import type { UserResponse } from "@/types/user.types";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

export const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  interface ProfileForm {
    nom: string;
    prenom: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    userApi
      .getMyProfile()
      .then((data) => {
        setProfile(data);
        reset({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch(() => setError(t("profile.loadError")))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    setError(null);
    setSuccess(null);

    if (data.newPassword && !data.currentPassword) {
      setError(t("profile.passwordRequired"));
      return;
    }

    setSaving(true);
    try {
      await userApi.updateMyProfile({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        ...(data.newPassword
          ? { currentPassword: data.currentPassword, newPassword: data.newPassword }
          : {}),
      });

      setSuccess(t("profile.updateSuccess"));
      reset((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      if (data.email !== authUser?.email) {
        setTimeout(() => {
          dispatch(logout());
          navigate("/login");
        }, 1500);
      }
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.error as string)
          : t("profile.updateError");
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const roleColors: Record<string, "default" | "primary" | "warning" | "success" | "error"> = {
    ADMIN: "error",
    CHEF_HIERARCHIE: "warning",
    SIGNATAIRE: "success",
    FONCTIONNAIRE: "primary",
  };

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>{t("common.loading")}</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          {t("navbar.monProfil")}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 4, borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}
          >
            <Avatar
              sx={{ width: 96, height: 96, bgcolor: "#1976d2", fontSize: 36, mx: "auto", mb: 2 }}
            >
              {profile?.prenom?.[0]}
              {profile?.nom?.[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
              {profile?.prenom} {profile?.nom}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
              {profile?.email}
            </Typography>
            <Chip
              label={profile?.role}
              color={roleColors[profile?.role ?? ""] ?? "default"}
              size="small"
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Paper sx={{ p: 4, borderRadius: "16px", mb: 3, border: "1px solid #e2e8f0" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
                <Badge sx={{ color: "#1976d2" }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {t("profile.infoAdmin")}
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.ppr")}
                    value={profile?.ppr ?? "—"}
                    disabled
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.grade")}
                    value={profile?.grade ?? "—"}
                    disabled
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.direction")}
                    value={profile?.directionNom ?? "—"}
                    disabled
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.division")}
                    value={profile?.divisionNom ?? "—"}
                    disabled
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.service")}
                    value={profile?.serviceNom ?? "—"}
                    disabled
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.dateDebutFonction")}
                    value={profile?.dateDebutFonction ?? "—"}
                    disabled
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: "16px", mb: 3, border: "1px solid #e2e8f0" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
                <Person sx={{ color: "#1976d2" }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {t("profile.infoPerso")}
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.nom")}
                    {...register("nom")}
                    error={!!errors.nom}
                    helperText={errors.nom?.message}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.prenom")}
                    {...register("prenom")}
                    error={!!errors.prenom}
                    helperText={errors.prenom?.message}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label={t("profile.email")}
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: "16px", mb: 3, border: "1px solid #e2e8f0" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                <Lock sx={{ color: "#1976d2" }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {t("profile.changerMotDePasse")}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
                {t("profile.mdpLeaveEmpty")}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.mdpActuel")}
                    type="password"
                    {...register("currentPassword")}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword?.message}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("profile.nouveauMdp")}
                    type="password"
                    {...register("newPassword")}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label={t("profile.confirmerNouveauMdp")}
                    type="password"
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Divider sx={{ mb: 3 }} />

            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <AppButton text={t("profile.saveButton")} type="submit" loading={saving} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
