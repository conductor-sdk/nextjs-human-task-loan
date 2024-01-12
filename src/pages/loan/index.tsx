import { Stack, Box, TextField, Select, MenuItem } from "@mui/material";
import {
  orkesConductorClient,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript/browser";
import MainLayout from "@/components/MainLayout";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/elements/buttons/Buttons";
import { useState } from "react";
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
const LOAN_TYPES = ["student", "auto", "home"];
type LoanType = "student" | "auto" | "home";

export default function Loan({ conductor, workflows, correlationId }: Props) {
  const [amount, setAmount] = useState(0);
  const [details, setDetails] = useState("");
  const [loanType, setLoanType] = useState<LoanType>("student");

  const router = useRouter();
  const handleRequestForLoan = () => {
    const runWorkflow = async () => {
      const client = await orkesConductorClient(conductor);
      const executionId = await new WorkflowExecutor(client).startWorkflow({
        name: workflows.requestForLoan,
        version: 1,
        input: {
          loanType,
          amount,
          details,
        },
        correlationId
      });
      console.log("correlationId", correlationId);
      //router.push(`/loan/${executionId}`);
    };
    runWorkflow();
  };

  return (
    <MainLayout title="Most Trusted">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>National Bank of Orkes</MainTitle>
        <Box>
          <SubText2 paragraph>Pick a loan type</SubText2>
        </Box>
        <Stack spacing={2} direction="column">
          <Select>
            {LOAN_TYPES.map((loanType) => (
              <MenuItem
                key={loanType}
                value={loanType}
                onChange={(ev: any) => setLoanType(ev.target.value as LoanType)}
              >
                {loanType}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Amount"
            onChange={(ev) => setAmount(Number(ev.target.value))}
            value={amount}
          />
          <TextField
            onChange={(ev) => setDetails(ev.target.value)}
            label="Details"
            multiline
            value={details}
          />
          <SecondaryButton onClick={handleRequestForLoan}>
            Submit
          </SecondaryButton>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
