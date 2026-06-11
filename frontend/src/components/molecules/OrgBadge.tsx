import { Box, Typography } from "@mui/material";

interface OrgBadgeProps {
  text: string;
}

export const OrgBadge = ({ text }: OrgBadgeProps) => {
  return (
    <Box
      sx={{
        bgcolor: "#f1f5f9", // soft gray pill
        color: "#475569", // dark gray text
        px: 1.5,
        py: 0.2,
        borderRadius: "6px",
        display: "inline-flex",
        alignItems: "center",
        ml: 2,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: "500", fontSize: "0.75rem" }}>
        {text}
      </Typography>
    </Box>
  );
};
