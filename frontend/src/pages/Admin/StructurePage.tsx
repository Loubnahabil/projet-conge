import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { OrgNode } from "@/components/molecules/OrgNode";
import { AppButton } from "@/components/atoms/AppButton";
import { StructureFormModal } from "@/components/organisms/StructureFormModal";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchStructureDependenciesThunk,
  deleteStructureNodeThunk,
  saveStructureNodeThunk,
} from "@/store/slices/structureSlice";
import type { FullDirection, FullDivision, FullService } from "@/types/structure.types";
import { useTranslation } from "react-i18next";

interface StructurePopupState {
  isOpen: boolean;
  mode: "create" | "edit";
  type: "direction" | "division" | "service";
  parentId: number | null;
  targetId: number | null;
  currentText: string;
}

const initialPopup: StructurePopupState = {
  isOpen: false,
  mode: "create",
  type: "direction",
  parentId: null,
  targetId: null,
  currentText: "",
};

export const StructurePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { treeData, loading, error, actionLoading } = useSelector(
    (state: RootState) => state.structure,
  );

  const [popup, setPopup] = useState<StructurePopupState>(initialPopup);

  useEffect(() => {
    dispatch(fetchStructureDependenciesThunk());
  }, [dispatch]);

  const openPopup = (params: {
    mode: "create" | "edit";
    type: "direction" | "division" | "service";
    parentId?: number | null;
    targetId?: number | null;
    currentText?: string;
  }) => {
    setPopup({
      isOpen: true,
      mode: params.mode,
      type: params.type,
      parentId: params.parentId ?? null,
      targetId: params.targetId ?? null,
      currentText: params.currentText ?? "",
    });
  };

  const closePopup = () => {
    setPopup(initialPopup);
  };

  const handleSave = async (nom: string) => {
    await dispatch(
      saveStructureNodeThunk({
        nom,
        mode: popup.mode,
        type: popup.type,
        parentId: popup.parentId,
        targetId: popup.targetId,
      }),
    );
    closePopup();
  };

  const handleDeleteItem = (type: "direction" | "division" | "service", id: number) => {
    if (window.confirm(`${t("structure.confirmDelete")} ${type} ?`)) {
      dispatch(deleteStructureNodeThunk({ type, id }));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LoadingSpinner />
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
          {t("structure.title")}
        </Typography>
        <AppButton
          text={t("structure.addDirection")}
          onClick={() => openPopup({ mode: "create", type: "direction" })}
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
            badgeText={`${dir.divisions?.length || 0} divisions · ${
              dir.divisions?.flatMap((d: FullDivision) => d.services || []).length || 0
            } services`}
            onAddChild={() =>
              openPopup({
                mode: "create",
                type: "division",
                parentId: dir.id,
              })
            }
            onEdit={() =>
              openPopup({
                mode: "edit",
                type: "direction",
                targetId: dir.id,
                currentText: dir.nom,
              })
            }
            onDelete={() => handleDeleteItem("direction", dir.id)}
          >
            {dir.divisions?.map((div: FullDivision) => (
              <OrgNode
                key={div.id}
                title={div.nom}
                type="division"
                badgeText={`${div.services?.length || 0} services`}
                onAddChild={() =>
                  openPopup({
                    mode: "create",
                    type: "service",
                    parentId: div.id,
                  })
                }
                onEdit={() =>
                  openPopup({
                    mode: "edit",
                    type: "division",
                    parentId: dir.id,
                    targetId: div.id,
                    currentText: div.nom,
                  })
                }
                onDelete={() => handleDeleteItem("division", div.id)}
              >
                {div.services?.map((ser: FullService) => (
                  <OrgNode
                    key={ser.id}
                    title={ser.nom}
                    type="service"
                    onEdit={() =>
                      openPopup({
                        mode: "edit",
                        type: "service",
                        parentId: ser.divisionId,
                        targetId: ser.id,
                        currentText: ser.nom,
                      })
                    }
                    onDelete={() => handleDeleteItem("service", ser.id)}
                  />
                ))}
              </OrgNode>
            ))}
          </OrgNode>
        ))}
      </Box>

      <StructureFormModal
        isOpen={popup.isOpen}
        mode={popup.mode}
        type={popup.type}
        currentText={popup.currentText}
        actionLoading={actionLoading}
        onClose={closePopup}
        onSave={handleSave}
      />
    </Box>
  );
};

export default StructurePage;
