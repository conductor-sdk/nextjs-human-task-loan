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
        <MainTitle>National Bank of Orkes</MainTitle>
        <Stack spacing={2}>
          <SubText1>Check out a basic example for a loan application</SubText1>
          <Box>
            <SubText2 paragraph>The user will be asked to fill out a form.</SubText2>
            <SubText2>Then the loan will be approved or denied</SubText2>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2}>
          <SecondaryButton href="/admin">Manage Loan Request</SecondaryButton>
          <PrimaryButton href="/loan">Start a Loan Application</PrimaryButton>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
