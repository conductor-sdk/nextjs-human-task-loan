import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import {
  orkesConductorClient,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript";
import getConfig from "next/config";
import jsCookie from "js-cookie";
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
    jsCookie.set("userId", userId);// not needed

    const runWorkflow = async () => {
      const client = await orkesConductorClient(conductor);
      const executionId = await new WorkflowExecutor(client).startWorkflow({
        name: workflows.requestForLoan,
        version: 1,
        input: {
          userId: userId,
        },
      });
     router.push(`/test/loan/${executionId}`); 
    };
    runWorkflow();
  };

  return (
    <Stack spacing={2} mt={20} pl={20} pr={20}>
      <TextField
        label="user-name"
        variant="outlined"
        onChange={(event) => setUserId(event.target.value)}
        value={userId}
      />
      <Button onClick={handleRequestForLoan}>Request For Loan</Button>
    </Stack>
  );
}
