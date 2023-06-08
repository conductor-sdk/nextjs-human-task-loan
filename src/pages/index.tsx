import Head from "next/head";
import MainLayout from "@/components/MainLayout";
import {
  MainTitle,
  SubText1,
  SubText2,
  TitleInTitleBar,
} from "@/components/elements/texts/Typographys";
import {
  SecondaryButton,
  PrimaryButton,
} from "@/components/elements/buttons/Buttons";
import { Paper, Typography, Box, Stack, Button } from "@mui/material";
import styles from "@/styles/Home.module.css";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import ApprovalIcon from "@mui/icons-material/Approval";
import CloseIcon from "@mui/icons-material/Close";

export default function Home() {
  return (
    <MainLayout title="Start Screen">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>National Bank of Orkes</MainTitle>
        <Stack spacing={2}>
          <SubText1>Check out a basic example for a loan application</SubText1>
          <Box>
            <SubText2>The user will be asked to fill out a form.</SubText2>
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
