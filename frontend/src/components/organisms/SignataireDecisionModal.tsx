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

import { AppButton } from "../atoms/AppButton";

interface SignataireDecisionModalProps {
  open: boolean;
  error: string | null;
  actionLoading: boolean;
  onCancel: () => void;
  onConfirm: (commentaire: string) => void;
}

export const SignataireDecisionModal = ({
  open,
  error: externalError,
  actionLoading,
  onCancel,
  onConfirm,
}: SignataireDecisionModalProps) => {
  const [commentaire, setCommentaire] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = () => {
    setLocalError(null);

    if (!commentaire.trim()) {
      setLocalError("Un commentaire est obligatoire en cas de rejet.");
      return;
    }

    onConfirm(commentaire);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
        Confirmer le rejet — Direction
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {(localError || externalError) && (
            <Alert severity="error">{localError || externalError}</Alert>
          )}

          <TextField
            label="Motif du rejet *"
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
          text="Annuler"
          variant="outlined"
          onClick={onCancel}
          disabled={actionLoading}
        />

        <AppButton
          text="Rejeter"
          onClick={handleSubmit}
          loading={actionLoading}
        />
      </DialogActions>
    </Dialog>
  );
};
