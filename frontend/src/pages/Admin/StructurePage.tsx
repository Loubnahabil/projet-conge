import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Alert } from "@mui/material";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { OrgNode } from "@/components/molecules/OrgNode";
import { AppButton } from "@/components/atoms/AppButton";
import { StructureFormModal } from "@/components/organisms/StructureFormModal";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchStructureDependencies,
  deleteStructureNode,
  saveStructureNode,
} from "@/store/slices/structureSlice";
import type { FullDirection, FullDivision, FullService } from "@/types/structure.types";
import { useTranslation } from "react-i18next";

interface StructureModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  type: "direction" | "division" | "service";
  parentId: number | null;
  targetId: number | null;
  currentText: string;
}

const initialModal: StructureModalState = {
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

  const [modal, setModal] = useState<StructureModalState>(initialModal);

  useEffect(() => {
    dispatch(fetchStructureDependencies());
  }, [dispatch]);

  const open = (params: {
    mode: "create" | "edit";
    type: "direction" | "division" | "service";
    parentId?: number | null;
    targetId?: number | null;
    currentText?: string;
  }) => {
    setModal({
      isOpen: true,
      mode: params.mode,
      type: params.type,
      parentId: params.parentId ?? null,
      targetId: params.targetId ?? null,
      currentText: params.currentText ?? "",
    });
  };

  const close = () => {
    setModal(initialModal);
  };

  const handleSave = async (nom: string) => {
    await dispatch(
      saveStructureNode({
        nom,
        mode: modal.mode,
        type: modal.type,
        parentId: modal.parentId,
        targetId: modal.targetId,
      }),
    );
    close();
  };

  const handleDeleteItem = (type: "direction" | "division" | "service", id: number) => {
    if (window.confirm(`${t("structure.confirmDelete")} ${type} ?`)) {
      dispatch(deleteStructureNode({ type, id }));
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
          onClick={() => open({ mode: "create", type: "direction" })}
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
              open({
                mode: "create",
                type: "division",
                parentId: dir.id,
              })
            }
            onEdit={() =>
              open({
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
                  open({
                    mode: "create",
                    type: "service",
                    parentId: div.id,
                  })
                }
                onEdit={() =>
                  open({
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
                      open({
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
        isOpen={modal.isOpen}
        mode={modal.mode}
        type={modal.type}
        currentText={modal.currentText}
        actionLoading={actionLoading}
        onClose={close}
        onSave={handleSave}
      />
    </Box>
  );
};

export default StructurePage;
