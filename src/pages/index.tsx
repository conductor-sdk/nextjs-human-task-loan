import MainLayout from "@/components/MainLayout";
import {
  MainTitle,
  SubText1,
  SubText2,
} from "@/components/elements/texts/Typographys";
import {
  SecondaryButton,
  PrimaryButton,
} from "@/components/elements/buttons/Buttons";
import { Box, Stack, } from "@mui/material";

export default function Home() {
  return (
    <MainLayout title="Start Screen">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Packet tracking</MainTitle>
        <Stack spacing={2}>
          <SubText1>Select the option</SubText1>
          <Box>
            <SubText2 paragraph>The user will be asked to fill out a form.</SubText2>
            <SubText2>Then the loan will be approved or denied</SubText2>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2}>
          <SecondaryButton href="/admin">Admin view</SecondaryButton>
          <PrimaryButton href="/packet">Start Packet</PrimaryButton>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
