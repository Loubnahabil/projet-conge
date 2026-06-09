import { useTranslation } from "react-i18next";
import { Chip, type SxProps, type Theme } from "@mui/material";
import { STATUS_COLOR, STATUS_TKEY } from "@/constants/constants";

interface StatusChipProps {
  statut: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
}

export const StatusChip = ({ statut, size = "small", sx }: StatusChipProps) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(STATUS_TKEY[statut] ?? statut)}
      color={STATUS_COLOR[statut] ?? "default"}
      size={size}
      sx={sx}
    />
  );
};
