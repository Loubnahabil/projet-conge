import { useTranslation } from "react-i18next";
import { Chip, type ChipProps, type SxProps, type Theme } from "@mui/material";

interface StatusChipProps {
  statut: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
}

export const StatusChip = ({ statut, size = "small", sx }: StatusChipProps) => {
  const { t } = useTranslation();

  const STATUT_CONFIG: Record<
    string,
    { label: string; color: ChipProps["color"] }
  > = {
    BROUILLON: { label: t("status.brouillon"), color: "default" },
    SOUMISE: { label: t("status.soumise"), color: "warning" },
    VISEE_CHEF: { label: t("status.viseeChef"), color: "info" },
    SIGNEE_DIRECTEUR: { label: t("status.signeeDirecteur"), color: "success" },
    REJETEE_CHEF: { label: t("status.rejeteeChef"), color: "error" },
    REJETEE_DIRECTEUR: { label: t("status.rejeteeDirecteur"), color: "error" },
    ANNULEE: { label: t("status.annulee"), color: "default" },
  };

  const config = STATUT_CONFIG[statut] || {
    label: statut,
    color: "default" as const,
  };
  return <Chip label={config.label} color={config.color} size={size} sx={sx} />;
};
