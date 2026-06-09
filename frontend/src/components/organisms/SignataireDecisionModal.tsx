import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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

interface SignataireDecisionModalProps {
  open: boolean;
  error: string | null;
  actionLoading: boolean;
  onClose: () => void;
  onConfirm: (commentaire: string) => void;
}

export const SignataireDecisionModal = ({
  open,
  error: externalError,
  actionLoading,
  onClose,
  onConfirm,
}: SignataireDecisionModalProps) => {
  const { t } = useTranslation();
  const [commentaire, setCommentaire] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = () => {
    setLocalError(null);

    if (!commentaire.trim()) {
      setLocalError(t("signataire.commentaireRequis"));
      return;
    }

    onConfirm(commentaire);
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
        {t("signataire.confirmerRejetDirection")}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {(localError || externalError) && (
            <Alert severity="error">{localError || externalError}</Alert>
          )}

          <TextField
            label={t("signataire.motifRejet")}
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
          onClick={onClose}
          disabled={actionLoading}
        />

        <AppButton
          text={t("signataire.rejeter")}
          onClick={handleSubmit}
          loading={actionLoading}
        />
      </DialogActions>
    </Dialog>
  );
};
