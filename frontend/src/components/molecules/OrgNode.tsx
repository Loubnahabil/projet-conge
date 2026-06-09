import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, IconButton } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Business,
  Folder,
  Settings,
} from "@mui/icons-material";
import { OrgBadge } from "@/components/molecules/OrgBadge";
import { AppButton } from "@/components/atoms/AppButton";

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
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    if (type === "direction")
      return <Business sx={{ color: "#1976d2", mr: 1 }} />;
    if (type === "division") return <Folder sx={{ color: "#e4a11b", mr: 1 }} />;
    return <Settings sx={{ color: "#2e7d32", mr: 1, fontSize: "1.1rem" }} />;
  };

  const hasChildren = Boolean(children);

  return (
    <Box sx={{ width: "100%", mb: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          color: "#333",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          "&:hover": { bgcolor: "#f8fafc" },
        }}
      >
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {type === "direction" && onAddChild && (
            <AppButton text={t("structure.addDivision")} variant="text" onClick={onAddChild} />
          )}
          {type === "division" && onAddChild && (
            <AppButton text={t("structure.addService")} variant="text" onClick={onAddChild} />
          )}

          <AppButton text={t("structure.modifier")} variant="text" onClick={onEdit} />

          <button
            onClick={onDelete}
            style={{
              background: "none",
              border: "none",
              color: "#d32f2f",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              padding: "4px 8px",
            }}
          >
            {t("structure.supprimer")}
          </button>
        </Box>
      </Box>

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
              bgcolor: "#cbd5e1",
            },
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};
