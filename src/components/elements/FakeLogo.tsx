import { styled } from "@mui/material/styles";

export const OuterCircle = styled("div")`
  background: #FF4500;
  border-radius: 50%;
  height: 30px;
  width: 30px;
  position: relative;
`;

export const InnerCircle = styled("div")`
  position: absolute;
  background: white;
  border-radius: 50%;
  height: 20px;
  width: 20px;
  top: -10%;
  left: 50%;
`;

export const FakeLogo = () => {
  return (
    <OuterCircle>
      <InnerCircle />
    </OuterCircle>
  );
};
