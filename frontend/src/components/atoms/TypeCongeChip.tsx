import { Chip, type ChipProps } from "@mui/material";

const TYPE_CONFIG: Record<string, { label: string; color: ChipProps["color"] }> = {
  ANNUEL: { label: "Annuel", color: "primary" },
  MALADIE: { label: "Maladie", color: "warning" },
};

interface TypeCongeChipProps {
  typeConge: string;
  size?: "small" | "medium";
}

export const TypeCongeChip = ({ typeConge, size = "small" }: TypeCongeChipProps) => {
  const config = TYPE_CONFIG[typeConge] || {
    label: typeConge,
    color: "default" as const,
  };
  return <Chip label={config.label} color={config.color} size={size} />;
};
