import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { OrgNode } from "../../components/organisms/OrgNode";
import { FormInput } from "../../components/molecules/FormInput";
import { AppButton } from "../../components/atoms/AppButton";
import { structureApi } from "../../api/structureApi";
import type {
  FullDirection,
  FullDivision,
  FullService,
  DivisionResponseDTO,
  ServiceResponseDTO,
} from "../../types/structure.types";

interface PopupState {
  isOpen: boolean;
  type: "direction" | "division" | "service" | null;
  mode: "create" | "edit";
  parentId?: number | null;
  targetId?: number | null;
}

export const StructurePage = () => {
  const [treeData, setTreeData] = useState<FullDirection[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: null,
    mode: "create",
    parentId: null,
    targetId: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{ nom: string }>();

  // Fixed render warning by wrapping structural assembly into a stable useCallback
  const loadOrganizationalTree = useCallback(async () => {
    try {
      setError(null);
      const [directions, divisions, services] = await Promise.all([
        structureApi.getDirections(),
        structureApi.getDivisions(),
        structureApi.getServices(),
      ]);

      const constructedTree: FullDirection[] = directions.map((dir) => {
        const matchingDivisions = divisions
          .filter((div: DivisionResponseDTO) => div.directionId === dir.id)
          .map((div: DivisionResponseDTO) => {
            const matchingServices = services.filter(
              (ser: ServiceResponseDTO) => ser.divisionId === div.id,
            ) as FullService[];
            return { ...div, services: matchingServices } as FullDivision;
          });
        return { ...dir, divisions: matchingDivisions } as FullDirection;
      });

      setTreeData(constructedTree);
    } catch (err) {
      console.error(err);
      setError(
        "Erreur de communication avec le serveur lors de la reconstruction de l'arborescence.",
      );
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  // Look for this block around line 89 and replace it completely with this:
  useEffect(() => {
    let isMounted = true;

    const executeLoadingTask = async () => {
      if (isMounted) {
        await loadOrganizationalTree();
      }
    };

    executeLoadingTask();

    return () => {
      isMounted = false; // Prevents state tracking leak changes if user leaves page quickly!
    };
  }, [loadOrganizationalTree]);

  const openPopup = (
    mode: "create" | "edit",
    type: "direction" | "division" | "service",
    parentId?: number,
    targetId?: number,
    currentText?: string,
  ) => {
    reset();
    if (mode === "edit" && currentText) {
      setValue("nom", currentText);
    }
    setPopup({ isOpen: true, type, mode, parentId, targetId });
  };

  const closePopup = () => {
    setPopup({
      isOpen: false,
      type: null,
      mode: "create",
      parentId: null,
      targetId: null,
    });
    reset();
  };

  const onSave = async (data: { nom: string }) => {
    setActionLoading(true);
    try {
      if (popup.mode === "create") {
        if (popup.type === "direction") {
          await structureApi.createDirection(data.nom);
        } else if (popup.type === "division" && popup.parentId) {
          await structureApi.createDivision(popup.parentId, data.nom);
        } else if (popup.type === "service" && popup.parentId) {
          await structureApi.createService(popup.parentId, data.nom);
        }
      } else if (popup.mode === "edit" && popup.targetId) {
        if (popup.type === "direction") {
          await structureApi.updateDirection(popup.targetId, data.nom);
        } else if (popup.type === "division" && popup.parentId) {
          await structureApi.updateDivision(
            popup.targetId,
            popup.parentId,
            data.nom,
          );
        } else if (popup.type === "service" && popup.parentId) {
          await structureApi.updateService(
            popup.targetId,
            popup.parentId,
            data.nom,
          );
        }
      }
      await loadOrganizationalTree();
      closePopup();
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (
    type: "direction" | "division" | "service",
    id: number,
  ) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer ce ${type} ?`)) return;
    try {
      if (type === "direction") await structureApi.deleteDirection(id);
      if (type === "division") await structureApi.deleteDivision(id);
      if (type === "service") await structureApi.deleteService(id);
      await loadOrganizationalTree();
    } catch (err) {
      console.error(err);
      alert(
        "Échec de la suppression. Vérifiez que la structure ne contient pas de sous-éléments.",
      );
    }
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
          Structure organisationnelle
        </Typography>
        <AppButton
          text="+ Ajouter une direction"
          onClick={() => openPopup("create", "direction")}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {treeData.map((dir: FullDirection) => (
          <OrgNode
            key={dir.id}
            title={dir.nom}
            type="direction"
            badgeText={`${dir.divisions?.length || 0} divisions · ${dir.divisions?.flatMap((d: FullDivision) => d.services || []).length || 0} services`}
            onAddChild={() => openPopup("create", "division", dir.id)}
            onEdit={() =>
              openPopup("edit", "direction", undefined, dir.id, dir.nom)
            }
            onDelete={() => handleDeleteItem("direction", dir.id)}
          >
            {dir.divisions?.map((div: FullDivision) => (
              <OrgNode
                key={div.id}
                title={div.nom}
                type="division"
                badgeText={`${div.services?.length || 0} services`}
                onAddChild={() => openPopup("create", "service", div.id)}
                onEdit={() =>
                  openPopup("edit", "division", dir.id, div.id, div.nom)
                } // Fixed: Passed dir.id instead of non-existent directionId
                onDelete={() => handleDeleteItem("division", div.id)}
              >
                {div.services?.map((ser: FullService) => (
                  <OrgNode
                    key={ser.id}
                    title={ser.nom}
                    type="service"
                    onEdit={() =>
                      openPopup(
                        "edit",
                        "service",
                        ser.divisionId,
                        ser.id,
                        ser.nom,
                      )
                    }
                    onDelete={() => handleDeleteItem("service", ser.id)}
                  />
                ))}
              </OrgNode>
            ))}
          </OrgNode>
        ))}
      </Box>

      <Dialog
        open={popup.isOpen}
        onClose={closePopup}
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
            ? `Ajouter une ${popup.type}`
            : `Modifier la ${popup.type}`}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSave)}
            noValidate
            sx={{ mt: 1 }}
          >
            <FormInput
              label={`Nom de la ${popup.type}`}
              registration={register("nom", {
                required: "Ce champ est obligatoire",
              })}
              error={!!errors.nom}
              helperText={errors.nom?.message}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
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

export default StructurePage;
