import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
  Typography,
} from "@mui/material";

import { AppButton } from "../atoms/AppButton";

interface SignataireUploadModalProps {
  open: boolean;
  error: string | null;
  actionLoading: boolean;
  onCancel: () => void;
  onUpload: (file: File) => void;
}

export const SignataireUploadModal = ({
  open,
  error,
  actionLoading,
  onCancel,
  onUpload,
}: SignataireUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
        Déposer la décision signée
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
            alignItems: "center",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Box
            sx={{
              border: "2px dashed #cbd5e1",
              borderRadius: "8px",
              p: 3,
              width: "100%",
              textAlign: "center",
              bgcolor: "#f8fafc",
            }}
          >
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              Sélectionnez l'arrêté de congé signé au format PDF ou Image.
            </Typography>

            <AppButton
              text={selectedFile ? selectedFile.name : "Choisir un fichier"}
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={actionLoading}
            />
          </Box>
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
          text="Déposer"
          onClick={handleSubmit}
          loading={actionLoading}
          disabled={!selectedFile}
        />
      </DialogActions>
    </Dialog>
  );
};
