import { Chip, type ChipProps } from "@mui/material";

export const STATUT_CONFIG: Record<
  string,
  { label: string; color: ChipProps["color"] }
> = {
  BROUILLON: { label: "Brouillon", color: "default" },
  SOUMISE: { label: "Soumise", color: "warning" },
  VISEE_CHEF: { label: "Visée par le Chef", color: "info" },
  SIGNEE_DIRECTEUR: { label: "Signée Directeur", color: "success" },
  REJETEE_CHEF: { label: "Rejetée Chef", color: "error" },
  REJETEE_DIRECTEUR: { label: "Rejetée Directeur", color: "error" },
  ANNULEE: { label: "Annulée", color: "default" },
};

interface StatusChipProps {
  statut: string;
  size?: "small" | "medium";
}

export const StatusChip = ({ statut, size = "small" }: StatusChipProps) => {
  const config = STATUT_CONFIG[statut] || {
    label: statut,
    color: "default" as const,
  };
  return <Chip label={config.label} color={config.color} size={size} />;
};
