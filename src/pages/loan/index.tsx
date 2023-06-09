import { useState } from "react";
import { Stack, Box, ThemeProvider, TextField } from "@mui/material";
import {
  orkesConductorClient,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript";
import MainLayout from "@/components/MainLayout";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/elements/buttons/Buttons";
import { baseTheme } from "@/components/FormDisplay";
import { MainTitle, SubText2 } from "@/components/elements/texts/Typographys";
import getConfig from "next/config";
import { useRouter } from "next/navigation";

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  // With the client pull the workflow with correlationId (correlation id is not really needed it just helps to group orders together)
  return {
    props: {
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
      workflows: publicRuntimeConfig.workflows,
      correlationId: publicRuntimeConfig.workflows.correlationId,
    },
  };
}

type Props = {
  conductor: {
    serverUrl: string;
    TOKEN: string;
  };
  workflows: Record<string, string>;
  correlationId: string;
};

export default function Loan({ conductor, workflows, correlationId }: Props) {
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();
  const handleRequestForLoan = () => {
    const runWorkflow = async () => {
      const client = await orkesConductorClient(conductor);
      const executionId = await new WorkflowExecutor(client).startWorkflow({
        name: workflows.requestForLoan,
        version: 1,
        input: {
          userId: userId,
        },
      });
      router.push(`/loan/${executionId}`);
    };
    runWorkflow();
  };
  const hasUserId = userId.trim().length == 0;

  return (
    <MainLayout title="Most Trusted">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>National Bank of Orkes</MainTitle>
        <Box>
          <SubText2 paragraph>
            Enter a username to start a loan or see existing loans.
          </SubText2>
        </Box>
        <TextField
          label="Username"
          onChange={(event) => setUserId(event.target.value)}
          variant="filled"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            disableUnderline: true,
          }}
          sx={{
            "& .MuiInputBase-root": {
              background: "#F1F6F7",
              borderRadius: "11px 11px 11px 11px !important",
              "& .MuiInputAdornment-root": {
                paddingRight: "15px",
                marginBottom: "10px",
              },
            },
            "& .MuiFormLabel-root": {
              fontSize: "12px",
            }
          }}
        />
        <Stack spacing={2} direction="row">
          <SecondaryButton onClick={handleRequestForLoan} disabled={hasUserId}>
            Start a New Loan
          </SecondaryButton>
          <PrimaryButton href={`/loan/user/${userId}`}>
            Continue Existing Loan
          </PrimaryButton>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
