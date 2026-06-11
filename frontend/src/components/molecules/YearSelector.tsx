import React from "react";
import { useTranslation } from "react-i18next";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const yearsList = [currentYear - 1, currentYear, currentYear + 1];

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="year-selector-label">{t("yearSelector.annee")}</InputLabel>
      <Select
        labelId="year-selector-label"
        value={value}
        label={t("yearSelector.annee")}
        onChange={handleSelectChange}
      >
        {yearsList.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
