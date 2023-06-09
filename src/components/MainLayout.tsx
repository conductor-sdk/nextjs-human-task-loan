import Head from "next/head";
import { ReactNode, FC } from "react";
import { IconButton, Stack, Box, AppBar, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FakeLogo } from "./elements/FakeLogo";
import { TitleInTitleBar } from "@/components/elements/texts/Typographys";

export const TitleBar: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <AppBar color="inherit" variant="elevation" elevation={3}>
      {children}
    </AppBar>
  );
};

const ClosableTitleBar = ({ title }: { title: string }) => {
  return (
    <TitleBar>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        sx={{
          padding: "20px",
        }}
      >
        <Box>
          <Stack direction={"row"} spacing={2}>
            <FakeLogo />
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "17px",
                color: "#000000",
              }}
            >
              National Bank
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingRight: "140px", // this is not ok should use gird instead
          }}
        >
          <TitleInTitleBar>{title}</TitleInTitleBar>
        </Box>
        <Box
          sx={{
            border: "1px solid #000000",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <IconButton href="/">
            <CloseIcon
              sx={{
                color: "#000000",
              }}
            />
          </IconButton>
        </Box>
      </Stack>
    </TitleBar>
  );
};
type Props = {
  children: ReactNode;
  title: string;
};

export default function MainLayout({ title, children }: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ClosableTitleBar title={title} />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "120px",
        }}
      >
        <Box p={10}>{children}</Box>
      </main>
      <div
        style={{
          position: "fixed",
          bottom: "0",
          right: 10,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box>
          <a href="https://orkes.io/">
            <img
              src="/orkesLogo.png"
              alt="orkesLogo"
              width="100px"
              height="50px"
            />
          </a>
        </Box>
        <p
          style={{
            marginLeft: "10px",
            color: "#000",
            opacity: "0.5",
            fontSize: "15px",
          }}
        >
          Powered by Orkes
        </p>
      </div>
    </>
  );
}
