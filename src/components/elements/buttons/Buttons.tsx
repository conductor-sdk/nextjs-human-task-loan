import { Button, ButtonProps } from "@mui/material";

const fontStyles = {
  fontWeight: "400",
  lineHeight: "17px",
  textAlign: "center",
  fontSize: "14px",
};

const buttonStyles = {
  borderRadius: "108px",
  textTransform: "none",
  height: "33px",
  paddingLeft: "33px",
  paddingRight: "33px",
};

export const SecondaryButton = (buttonProps: ButtonProps) => {
  return (
    <Button
      variant="contained"
      color="secondary"
      disableRipple
      sx={{
        ...buttonStyles,
        ...fontStyles,
        color: "#172D34",
      }}
      {...buttonProps}
    />
  );
};

export const PrimaryButton = (buttonProps: ButtonProps) => {
  return (
    <Button
      variant="contained"
      color="primary"
      disableRipple
      sx={{
        ...buttonStyles,
        ...fontStyles,
        color: "#FFFFFF",
        background:
          "linear-gradient(79.05deg, #f5203f 3.38%,#fa481e 60.18%,#fca729 96.71%)",
      }}
      {...buttonProps}
    />
  );
};

export const OpenButton = (buttonProps: ButtonProps) => {
  return (
    <Button
      variant="contained"
      sx={{
        width: "86px",
        height: "25px",
        borderRadius: "108px",
        fontWeight: 400,
        fontSize: "16px",
        textAlign: "center",
        background: "#686868",
        textTransform: "none",
        color: "#FFFFFF",
      }}
      {...buttonProps}
    />
  );
};
