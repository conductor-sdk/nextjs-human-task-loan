import React from "react";
import _isUndefined from "lodash/isUndefined";
import { Typography, Box } from "@mui/material";

export interface DescriptionTextProps {
  id?: string;
  value: string;
  align?: "left" | "center" | "right" | "justify" | "inherit";
  noWrap?: boolean;
  paragraph?: boolean;
  gutterBottom?: boolean;
  variant?:
    | "inherit"
    | "button"
    | "overline"
    | "caption"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2";
  label?: string;
}

const DescriptionText: React.FC<DescriptionTextProps> = ({
  id,
  value,
  align = "inherit",
  gutterBottom = false,
  noWrap = false,
  paragraph = false,
  label,
}) => {
  return (
    <Box mb={2}>
      <Typography
        key={id}
        align={align}
        gutterBottom={gutterBottom}
        noWrap={noWrap}
        paragraph={paragraph}
      >
        {_isUndefined(value) ? label : value}
      </Typography>
    </Box>
  );
};

export default DescriptionText;
