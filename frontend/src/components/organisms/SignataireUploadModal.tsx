import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
} from "@mui/material";
import { AppButton } from "@/components/atoms/AppButton";
import { FileUploadField } from "@/components/molecules/FileUploadField";

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

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
        Déposer la décision signée
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Validation + prévisualisation intégrées dans FileUploadField */}
          <FileUploadField onChange={handleFileChange} />
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
