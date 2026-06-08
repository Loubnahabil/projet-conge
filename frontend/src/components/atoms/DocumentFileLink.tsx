import { Stack, Typography } from "@mui/material";
import { InsertDriveFile } from "@mui/icons-material";

interface DocumentFileLinkProps {
  nomFichier: string;
  onClick: () => void;
}

export const DocumentFileLink = ({ nomFichier, onClick }: DocumentFileLinkProps) => (
  <Stack
    direction="row"
    spacing={1}
    onClick={onClick}
    sx={{
      alignItems: "center",
      p: 1.5,
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      bgcolor: "#f8fafc",
      cursor: "pointer",
      "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" },
    }}
  >
    <InsertDriveFile sx={{ color: "#64748b", fontSize: 20 }} />
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {nomFichier}
    </Typography>
  </Stack>
);
