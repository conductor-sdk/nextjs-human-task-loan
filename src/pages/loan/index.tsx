import { useState } from "react";
import { Button, Stack, TextField, Box } from "@mui/material";
import {
  orkesConductorClient,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript";
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

export default function Test({ conductor, workflows, correlationId }: Props) {
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

  return (
    <Stack direction="row" spacing={2} mt={20} pl={20} pr={20}>
      <Box>
        <TextField
          label="user-name"
          variant="outlined"
          onChange={(event) => setUserId(event.target.value)}
          value={userId}
        />
      </Box>
      <Stack spacing={2} direction="row">
        <Button onClick={handleRequestForLoan}>Request For Loan</Button>
        <Button href={`/loan/user/${userId}`}>Continue existing loan</Button>
      </Stack>
    </Stack>
  );
}
