import { LoanApprovals } from "@/components/elements/admin/LoanApprovals";
import {
  orkesConductorClient,
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";

import { Stack, Typography, Button, Box, Paper } from "@mui/material";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import styles from "@/styles/Home.module.css";
import Head from "next/head";
import {
  assignTaskAndClaim,
  getClaimedAndUnClaimedTasksForAssignee,
} from "../../utils/helpers";

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  const humanExecutor = new HumanExecutor(client);

  const { claimedTasks, unClaimedTasks } =
    await getClaimedAndUnClaimedTasksForAssignee(
      humanExecutor,
      "approval-interim-group"
    );
  // With the client pull the workflow with correlationId (correlation id is not really needed it just helps to group orders together)
  return {
    props: {
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
      workflows: publicRuntimeConfig.workflows,
      correlationId: publicRuntimeConfig.workflows.correlationId,
      unClaimedTasks,
      claimedTasks,
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
  unClaimedTasks: HumanTaskEntry[];
  claimedTasks: HumanTaskEntry[];
};

export default function Test({
  conductor,
  unClaimedTasks,
  claimedTasks,
}: Props) {
  const router = useRouter();
  const handleSelectTask = async (selectedTask: HumanTaskEntry) => {
    const { taskId, state } = selectedTask;
    let task = selectedTask;

    const humanExecutor = new HumanExecutor(
      await orkesConductorClient(conductor)
    );
    if (state === "ASSIGNED") {
      try {
        const claimedTask = await assignTaskAndClaim(
          humanExecutor,
          taskId!,
          "admin"
        );

        task = claimedTask;
      } catch (error: any) {
        console.log("error", error);
      }
    }
    router.push(`/admin/${task.taskId}`);
  };

  return (
    <>
      <Head>
        <title>Loan Approval</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Box>
          <Box sx={{ marginLeft: 20, marginRight: 20 }}>
            <Button variant="text" href={`/`} fullWidth={false}>
              Home
            </Button>
          </Box>

          <Paper sx={{ marginLeft: 20, marginRight: 20 }} variant="outlined">
            <LoanApprovals
              claimedTasks={claimedTasks}
              unClaimedTasks={unClaimedTasks}
              onSelectTask={handleSelectTask}
            />
          </Paper>
        </Box>
      </main>
    </>
  );
}
