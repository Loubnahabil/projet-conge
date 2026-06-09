import { useTranslation } from "react-i18next";
import { Chip, type ChipProps } from "@mui/material";

interface TypeCongeChipProps {
  typeConge: string;
  size?: "small" | "medium";
}

export const TypeCongeChip = ({ typeConge, size = "small" }: TypeCongeChipProps) => {
  const { t } = useTranslation();

  const TYPE_CONFIG: Record<string, { label: string; color: ChipProps["color"] }> = {
    ANNUEL: { label: t("leaveType.annuel"), color: "primary" },
    MALADIE: { label: t("leaveType.maladie"), color: "warning" },
  };

  const config = TYPE_CONFIG[typeConge] || {
    label: typeConge,
    color: "default" as const,
  };
  return <Chip label={config.label} color={config.color} size={size} />;
};
