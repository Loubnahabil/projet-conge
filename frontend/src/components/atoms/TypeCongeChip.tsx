import { useTranslation } from "react-i18next";
import { Chip } from "@mui/material";
import { TYPE_COLOR, TYPE_TKEY } from "@/constants/constants";

interface TypeCongeChipProps {
  typeConge: string;
  size?: "small" | "medium";
}

export const TypeCongeChip = ({ typeConge, size = "small" }: TypeCongeChipProps) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(TYPE_TKEY[typeConge] ?? typeConge)}
      color={TYPE_COLOR[typeConge] ?? "default"}
      size={size}
    />
  );
};
