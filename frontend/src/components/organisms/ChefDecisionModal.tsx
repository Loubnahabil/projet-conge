import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Alert,
} from "@mui/material";

import { AppButton } from "@/components/atoms/AppButton";

interface ChefDecisionModalProps {
  open: boolean;
  mode: "approve" | "reject" | null;
  error: string | null;
  actionLoading: boolean;
  onCancel: () => void;
  onConfirm: (commentaire: string) => void;
}

export const ChefDecisionModal = ({
  open,
  mode,
  error: externalError,
  actionLoading,
  onCancel,
  onConfirm,
}: ChefDecisionModalProps) => {
  const { t } = useTranslation();
  const [commentaire, setCommentaire] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const resetState = () => {
    setCommentaire("");
    setLocalError(null);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleValidationSubmit = () => {
    setLocalError(null);

    if (mode === "reject" && !commentaire.trim()) {
      setLocalError(t("chef.commentaireRequis"));
      return;
    }

    onConfirm(commentaire);
    resetState();
  };

  const activeError = localError || externalError;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
        {t(mode === "approve" ? "chef.confirmerApprobation" : "chef.confirmerRejet")}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {activeError && <Alert severity="error">{activeError}</Alert>}

          <TextField
            label={
              mode === "reject" ? t("chef.motifRejet") : t("chef.commentaire")
            }
            multiline
            rows={3}
            size="small"
            fullWidth
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            disabled={actionLoading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <AppButton
          text={t("common.cancel")}
          variant="outlined"
          onClick={handleCancel}
          disabled={actionLoading}
        />

        <AppButton
          text={t(mode === "approve" ? "chef.approuver" : "chef.rejeter")}
          onClick={handleValidationSubmit}
          loading={actionLoading}
        />
      </DialogActions>
    </Dialog>
  );
};
