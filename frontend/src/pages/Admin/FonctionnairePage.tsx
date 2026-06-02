import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search, Edit, Delete, Person } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../components/molecules/FormInput";
import { AppButton } from "../../components/atoms/AppButton";
import { userApi } from "../../api/userApi";
import { structureApi } from "../../api/structureApi";
import { userValidationSchema } from "../../validations/userSchema";
import type { UserResponseDTO } from "../../types/user.types";
import type {
  DirectionResponseDTO,
  DivisionResponseDTO,
  ServiceResponseDTO,
} from "../../types/structure.types";
import type { UserRequestDTO } from "../../types/user.types";

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

export const FonctionnairePage = () => {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [globalLoading, setGlobalLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [directions, setDirections] = useState<DirectionResponseDTO[]>([]);
  const [divisions, setDivisions] = useState<DivisionResponseDTO[]>([]);
  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]); // 👈 Real DB Roles State

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    targetId?: number | null;
  }>({
    isOpen: false,
    mode: "create",
    targetId: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: yupResolver(userValidationSchema),
    context: { isCreate: popup.mode === "create" },
  });

  const watchedDirectionId = watch("directionId");
  const watchedDivisionId = watch("divisionId");

  const fetchUsersList = useCallback(
    async (
      search = searchQuery,
      currentPage = page,
      currentSize = rowsPerPage,
    ) => {
      try {
        const data = await userApi.getAll(search, currentPage, currentSize);
        setUsers(data.content || []);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        console.error(err);
        setError("Erreur de chargement de la liste des fonctionnaires.");
      }
    },
    [searchQuery, page, rowsPerPage],
  );

  const loadFormDependencies = useCallback(async () => {
    try {
      const [dirs, divs, servs, fetchedRoles] = await Promise.all([
        structureApi.getDirections(),
        structureApi.getDivisions(),
        structureApi.getServices(),
        structureApi.getRoles(), // 👈 Hits your new RoleController endpoint
      ]);
      setDirections(dirs);
      setDivisions(divs);
      setServices(servs);
      setRoles(fetchedRoles);
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const executeInit = async () => {
      if (isMounted) {
        await Promise.all([fetchUsersList(), loadFormDependencies()]);
      }
    };
    executeInit();
    return () => {
      isMounted = false;
    };
  }, [fetchUsersList, loadFormDependencies]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    fetchUsersList(searchQuery, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updatedSize = parseInt(event.target.value, 10);
    setRowsPerPage(updatedSize);
    setPage(0);
    fetchUsersList(searchQuery, 0, updatedSize);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setPage(0);
    fetchUsersList(value, 0, rowsPerPage);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await userApi.toggleEnabled(id);
      await fetchUsersList();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de statut actif/inactif.");
    }
  };

  const openPopup = (mode: "create" | "edit", user?: UserResponseDTO) => {
    reset();
    if (mode === "edit" && user) {
      setValue("nom", user.nom);
      setValue("prenom", user.prenom);
      setValue("email", user.email);
      setValue("ppr", user.ppr);
      setValue("grade", user.grade);
      setValue("dateDebutFonction", user.dateDebutFonction);
      setValue("directionId", user.directionId?.toString() || "");
      setValue("divisionId", user.divisionId?.toString() || "");
      setValue("serviceId", user.serviceId?.toString() || "");

      // ⚡ Finds the matching ID matching your real database role name (e.g. "FONCTIONNAIRE")
      const matchingRole = roles.find((r) => r.name === user.role);
      setValue("roleId", matchingRole ? matchingRole.id.toString() : "");

      setPopup({ isOpen: true, mode: "edit", targetId: user.id });
    } else {
      setPopup({ isOpen: true, mode: "create", targetId: null });
    }
  };

  const closePopup = () => {
    setPopup({ isOpen: false, mode: "create", targetId: null });
    reset();
  };

  const onSave = async (data: UserFormInputs) => {
    setActionLoading(true);

    const payload: UserRequestDTO = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      ppr: data.ppr,
      grade: data.grade,
      dateDebutFonction: data.dateDebutFonction,
      serviceId: Number(data.serviceId),
      roleId: Number(data.roleId),
      ...(popup.mode === "create" ? { password: data.password } : {}),
    };

    try {
      if (popup.mode === "create") {
        await userApi.create(payload);
      } else if (popup.mode === "edit" && popup.targetId) {
        await userApi.update(popup.targetId, payload);
      }
      await fetchUsersList();
      closePopup();
    } catch (err) {
      console.error(err);
      alert(
        "Erreur lors de l'enregistrement des modifications du fonctionnaire.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce fonctionnaire ?"))
      return;
    try {
      await userApi.delete(id);
      await fetchUsersList();
    } catch (err) {
      console.error(err);
      alert(
        "Impossible de supprimer ce profil car des dépendances y sont rattachées.",
      );
    }
  };

  // Helper helper function to transform "CHEF_HIERARCHIE" into "Chef Hierarchie" cleanly
  const formatRoleLabel = (name: string) => {
    return name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (globalLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, minHeight: "100vh", bgcolor: "transparent" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "700", color: "#1e293b" }}>
          Gestion des Fonctionnaires
        </Typography>
        <AppButton
          text="+ Ajouter un Fonctionnaire"
          onClick={() => openPopup("create")}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher par PPR, Nom, Email..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: "350px", bgcolor: "#fff", borderRadius: "8px" }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                PPR
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Fonctionnaire
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Structure Affectation
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Grade
              </TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#475569" }}>
                Actif
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "600", color: "#475569", pr: 4 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "#64748b" }}
                >
                  <Person
                    sx={{ fontSize: "2.5rem", mb: 1, color: "#94a3b8" }}
                  />
                  <Typography variant="body2">
                    Aucun fonctionnaire trouvé dans le système.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ "&:hover": { bgcolor: "#fcfdfe" } }}
                >
                  <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
                    {user.ppr}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "600", color: "#1e293b" }}
                      >
                        {user.nom.toUpperCase()} {user.prenom}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#334155" }}>
                        {user.directionNom}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", display: "block" }}
                      >
                        {user.divisionNom} &bull; {user.serviceNom}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#475569" }}>{user.grade}</TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      checked={user.enabled}
                      onChange={() => handleToggleStatus(user.id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => openPopup("edit", user)}
                      sx={{ color: "#1976d2", mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user.id)}
                      sx={{ color: "#d32f2f" }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
        />
      </TableContainer>

      {/* Input Modal Form */}
      <Dialog open={popup.isOpen} onClose={closePopup} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
          {popup.mode === "create"
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
              {/* Note: If FormInput wraps a standard TextField, ensure it accepts 'required' or passes props downstream */}
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

            {popup.mode === "create" && (
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
              required // 👈 Shows the red '*' natively on the label field
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
              required // 👈 Shows red '*'
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
              required // 👈 Shows red '*'
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
              required // 👈 Shows red '*'
              label="Rôle Système"
              size="small"
              slotProps={{ select: { displayEmpty: true } }}
              {...register("roleId")}
              error={!!errors.roleId}
              helperText={errors.roleId?.message}
              fullWidth
            >
              {/* ⚡ Loops dynamically through your real database roles array */}
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id.toString()}>
                  {formatRoleLabel(r.name)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <AppButton
            text="Annuler"
            variant="outlined"
            onClick={closePopup}
            disabled={actionLoading}
          />
          <AppButton
            text="Enregistrer"
            onClick={handleSubmit(onSave)}
            loading={actionLoading}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FonctionnairePage;
