import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  width = "350px",
}) => {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ width, bgcolor: "#fff", borderRadius: "8px" }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "#94a3b8" }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
