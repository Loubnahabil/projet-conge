import React, { useRef, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  CloudUpload,
  Close,
  InsertDriveFile,
  Image,
} from "@mui/icons-material";

interface FileUploadFieldProps {
  accept?: string;
  error?: string | null;
  required?: boolean;
  existingFileName?: string | null;
  onChange: (file: File | null) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

export const FileUploadField = ({
  accept = ".pdf,.jpg,.jpeg,.png",
  error,
  existingFileName,
  onChange,
}: FileUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // URL preview pour images

  const validate = (f: File): string | null => {
    // Validation extension
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext))
      return "Format non autorisé (PDF, JPG, PNG uniquement)";

    // Validation taille
    if (f.size > MAX_SIZE)
      return `Fichier trop lourd (max 5 Mo, actuel : ${(f.size / 1024 / 1024).toFixed(1)} Mo)`;

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setLocalError(null);
    setPreview(null);

    if (!selected) return;

    const validationError = validate(selected);
    if (validationError) {
      setLocalError(validationError);
      onChange(null);
      // Reset input pour pouvoir re-sélectionner le même fichier
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFile(selected);
    onChange(selected);

    // Prévisualisation image uniquement
    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handlePreview = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
  };

  const displayError = error || localError;
  const isPdf = file?.name.toLowerCase().endsWith(".pdf");

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        onChange={handleChange}
      />

      {/* Zone de drop / sélection */}
      {!file && !existingFileName && (
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            border: displayError ? "2px dashed #ef4444" : "2px dashed #cbd5e1",
            borderRadius: "12px",
            p: 3,
            textAlign: "center",
            bgcolor: "#f8fafc",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" },
          }}
        >
          <CloudUpload sx={{ fontSize: 32, color: "#64748b", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "#475569" }}>
            Cliquez pour sélectionner un fichier
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            PDF, PNG, JPG — max 5 Mo
          </Typography>
        </Box>
      )}

      {/* Fichier existant (mode édition) */}
      {!file && existingFileName && (
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            border: "2px dashed #22c55e",
            borderRadius: "12px",
            p: 2,
            bgcolor: "#f0fdf4",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            transition: "all 0.2s",
            "&:hover": { bgcolor: "#dcfce7", borderColor: "#16a34a" },
          }}
        >
          <InsertDriveFile sx={{ color: "#22c55e", fontSize: 28 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#166534" }}>
              {existingFileName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#16a34a" }}>
              Cliquez pour remplacer ce fichier
            </Typography>
          </Box>
        </Box>
      )}

      {/* Prévisualisation image */}
      {file && preview && (
        <Box
          onClick={handlePreview}
          sx={{
            position: "relative",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
            bgcolor: "#f8fafc",
            cursor: "pointer",
          }}
        >
          <img
            src={preview}
            alt="Prévisualisation"
            style={{
              width: "100%",
              maxHeight: 220,
              objectFit: "contain",
              display: "block",
            }}
          />
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Image fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="caption" sx={{ color: "#475569" }}>
                {file.name} ({(file.size / 1024).toFixed(0)} Ko)
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              sx={{ color: "#ef4444" }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Prévisualisation PDF (pas d'image → juste infos) */}
      {file && isPdf && (
        <Box
          onClick={handlePreview}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            p: 2,
            bgcolor: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <InsertDriveFile sx={{ color: "#ef4444", fontSize: 32 }} />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#1e293b" }}
              >
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {(file.size / 1024).toFixed(0)} Ko — PDF
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            sx={{ color: "#ef4444" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Message d'erreur */}
      {displayError && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: "block" }}
        >
          {displayError}
        </Typography>
      )}
    </Box>
  );
};
