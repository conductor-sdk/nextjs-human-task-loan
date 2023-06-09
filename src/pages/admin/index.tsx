import { ReactNode, useMemo, useCallback } from "react";
import {
  orkesConductorClient,
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";

import { MainTitle } from "@/components/elements/texts/Typographys";
import MainLayout from "@/components/MainLayout";
import { Stack } from "@mui/material";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import {
  formatDate,
  assignTaskAndClaim,
  getClaimedAndUnClaimedTasksForAssignee,
} from "../../utils/helpers";
import {
  TaskTable,
  StatusRenderer,
  ValueRenderers,
} from "@/components/elements/table/Table";
import { OpenButton } from "@/components/elements/buttons/Buttons";

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

const columnRenderer: ValueRenderers = {
  Id: {
    renderer: (t: HumanTaskEntry) => t.taskId!,
    sortId: "taskId",
  },
  Date: {
    renderer: (t: HumanTaskEntry) => formatDate(t.createdOn!),
    sortId: "createdOn",
  },
  "Task Name": {
    renderer: (t: HumanTaskEntry) => t.taskName!,
    sortId: "taskName",
  },
  Status: {
    renderer: (t: HumanTaskEntry) => <StatusRenderer state={t.state!} />,
    sortId: "state",
  },
};

export default function Admin({
  conductor,
  unClaimedTasks,
  claimedTasks,
}: Props) {
  const router = useRouter();
  const handleSelectTask = useCallback(
    async (selectedTask: HumanTaskEntry) => {
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
    },
    [router, conductor]
  );
  const tasks = unClaimedTasks.concat(claimedTasks);
  const columnsWithContext = useMemo(() => {
    return {
      ...columnRenderer,
      Open: {
        renderer: (t: HumanTaskEntry) => (
          <OpenButton onClick={() => handleSelectTask(t)}>Open</OpenButton>
        ),
      },
    };
  }, [handleSelectTask]);

  return (
    <MainLayout title="Loan Inbox">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Loan Inbox</MainTitle>
        <TaskTable tasks={tasks} columns={columnsWithContext} />
      </Stack>
    </MainLayout>
  );
}
