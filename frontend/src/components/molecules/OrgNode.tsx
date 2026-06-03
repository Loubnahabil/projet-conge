import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Business,
  Folder,
  Settings,
} from "@mui/icons-material";
// 🌟 Fixed this import! Changed from "../molecules/OrgBadge" to "../molecules/OrgBadge" (or wherever your molecules sit relative to organisms)
// If OrgBadge is in molecules: "../../components/molecules/OrgBadge" or "../molecules/OrgBadge" depending on your exact folder nesting level
import { OrgBadge } from "../molecules/OrgBadge";
import { AppButton } from "../atoms/AppButton";

interface OrgNodeProps {
  title: string;
  type: "direction" | "division" | "service";
  badgeText?: string;
  onAddChild?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

export const OrgNode = ({
  title,
  type,
  badgeText,
  onAddChild,
  onEdit,
  onDelete,
  children,
}: OrgNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    if (type === "direction")
      return <Business sx={{ color: "#1976d2", mr: 1 }} />; // Matches your blue header
    if (type === "division") return <Folder sx={{ color: "#e4a11b", mr: 1 }} />;
    return <Settings sx={{ color: "#2e7d32", mr: 1, fontSize: "1.1rem" }} />;
  };

  const hasChildren = Boolean(children);

  return (
    <Box sx={{ width: "100%", mb: 1 }}>
      {/* Light Mode Row Container */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          bgcolor: "#fff", // Crisp white base rows
          border: "1px solid #e2e8f0", // Clean soft border dividers
          borderRadius: "8px",
          color: "#333", // Crisp dark readable text
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          "&:hover": { bgcolor: "#f8fafc" },
        }}
      >
        {/* Left Section */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          {type !== "service" ? (
            <IconButton
              size="small"
              onClick={() => setIsOpen(!isOpen)}
              sx={{ color: "#64748b", mr: 0.5, p: 0.2 }}
            >
              {isOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          ) : (
            <Box sx={{ width: 28 }} />
          )}

          {getIcon()}

          <Typography
            sx={{
              fontWeight: type === "direction" ? "600" : "400",
              fontSize: "0.95rem",
              color: "#1e293b",
            }}
          >
            {title}
          </Typography>

          {badgeText && <OrgBadge text={badgeText} />}
        </Box>

        {/* Right Section Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {type === "direction" && onAddChild && (
            <AppButton text="+ Division" variant="text" onClick={onAddChild} />
          )}
          {type === "division" && onAddChild && (
            <AppButton text="+ Service" variant="text" onClick={onAddChild} />
          )}

          <AppButton text="Modifier" variant="text" onClick={onEdit} />

          <button
            onClick={onDelete}
            style={{
              background: "none",
              border: "none",
              color: "#d32f2f", // Clear administrative red
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              padding: "4px 8px",
            }}
          >
            Supprimer
          </button>
        </Box>
      </Box>

      {/* Expanded Hierarchy branch with clean dark-gray indicator line */}
      {isOpen && hasChildren && (
        <Box
          sx={{
            pl: 4,
            mt: 1,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              left: "18px",
              top: 0,
              bottom: "16px",
              width: "1.5px",
              bgcolor: "#cbd5e1", // Light grey branch lines
            },
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};
