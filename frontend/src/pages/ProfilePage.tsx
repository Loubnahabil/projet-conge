import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { Person, Lock, Badge } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { userApi } from "@/api/userApi";
import { AppButton } from "@/components/atoms/AppButton";
import { logout } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import type { UserResponseDTO } from "@/types/user.types";

export const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    userApi
      .getMyProfile()
      .then((data) => {
        setProfile(data);
        setNom(data.nom);
        setPrenom(data.prenom);
        setEmail(data.email);
      })
      .catch(() => setError("Impossible de charger votre profil."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword && !currentPassword) {
      setError("Veuillez saisir votre mot de passe actuel.");
      return;
    }

    setSaving(true);
    try {
      await userApi.updateMyProfile({
        nom,
        prenom,
        email,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });

      setSuccess("Profil mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // If email changed, force re-login
      if (email !== authUser?.email) {
        setTimeout(() => {
          dispatch(logout());
          navigate("/login");
        }, 1500);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const roleColors: Record<
    string,
    "default" | "primary" | "warning" | "success" | "error"
  > = {
    ADMIN: "error",
    CHEF_HIERARCHIE: "warning",
    SIGNATAIRE: "success",
    FONCTIONNAIRE: "primary",
  };

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Chargement...</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
      {/* Header card */}
      <Paper
        sx={{ p: 4, borderRadius: "16px", mb: 3, border: "1px solid #e2e8f0" }}
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
          <Avatar
            sx={{ width: 72, height: 72, bgcolor: "#1976d2", fontSize: 28 }}
          >
            {profile?.prenom?.[0]}
            {profile?.nom?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
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
          </Box>
        </Stack>
      </Paper>

      {/* Read-only info */}
      <Paper
        sx={{ p: 4, borderRadius: "16px", mb: 3, border: "1px solid #e2e8f0" }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
          <Badge sx={{ color: "#1976d2" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Informations administratives
          </Typography>
        </Stack>
        <Stack spacing={2}>
          <TextField
            label="PPR"
            value={profile?.ppr ?? "—"}
            disabled
            size="small"
            fullWidth
          />
          <TextField
            label="Grade / Échelle"
            value={profile?.grade ?? "—"}
            disabled
            size="small"
            fullWidth
          />
          <TextField
            label="Direction"
            value={profile?.directionNom ?? "—"}
            disabled
            size="small"
            fullWidth
          />
          <TextField
            label="Division"
            value={profile?.divisionNom ?? "—"}
            disabled
            size="small"
            fullWidth
          />
          <TextField
            label="Service"
            value={profile?.serviceNom ?? "—"}
            disabled
            size="small"
            fullWidth
          />
          <TextField
            label="Date de début de fonction"
            value={profile?.dateDebutFonction ?? "—"}
            disabled
            size="small"
            fullWidth
          />
        </Stack>
      </Paper>

      {/* Editable info */}
      <Paper
        sx={{ p: 4, borderRadius: "16px", mb: 3, border: "1px solid #e2e8f0" }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
          <Person sx={{ color: "#1976d2" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Informations personnelles
          </Typography>
        </Stack>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              size="small"
              fullWidth
            />
          </Stack>
          <TextField
            label="Email professionnel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            fullWidth
          />
        </Stack>
      </Paper>

      {/* Password change */}
      <Paper
        sx={{ p: 4, borderRadius: "16px", mb: 3, border: "1px solid #e2e8f0" }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
          <Lock sx={{ color: "#1976d2" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Changer le mot de passe
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
          Laissez vide si vous ne souhaitez pas modifier votre mot de passe.
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Mot de passe actuel"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Confirmer le nouveau mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            size="small"
            fullWidth
          />
        </Stack>
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
        <AppButton
          text="Enregistrer les modifications"
          onClick={handleSave}
          loading={saving}
        />
      </Stack>
    </Box>
  );
};
