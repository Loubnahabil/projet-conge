import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  value,
  onChange,
}) => {
  const currentYear = new Date().getFullYear();
  // Provide choices for previous year, current year, and next year
  const yearsList = [currentYear - 1, currentYear, currentYear + 1];

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="year-selector-label">Année</InputLabel>
      <Select
        labelId="year-selector-label"
        value={value}
        label="Année"
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
