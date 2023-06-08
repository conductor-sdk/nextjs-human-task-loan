import { Stack, Typography, Button, Box } from "@mui/material";
import getConfig from "next/config";
import {
  orkesConductorClient,
  HumanTaskEntry,
  ConductorClient,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";
import { GetServerSidePropsContext } from "next";
import {
  TaskTable,
  StatusRenderer,
  OpenButton,
} from "@/components/elements/table/Table";
import { MainTitle } from "@/components/elements/texts/Typographys";
import _path from "lodash/fp/path";
import { formatDate } from "@/utils/helpers";
import MainLayout from "@/components/MainLayout";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client: ConductorClient = await clientPromise;
  const userId = context.params?.userId as string;
  const humanExecutor = new HumanExecutor(client);
  const tasks = await humanExecutor.getTasksByFilter("IN_PROGRESS", userId);

  const completedTasks = await humanExecutor.getTasksByFilter(
    "COMPLETED",
    userId
  );

  // Assert Workflow is waiting on human task
  return {
    props: {
      userId,
      tasks,
      completedTasks,
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
    },
  };
}

type Props = {
  userId: string;
  tasks: HumanTaskEntry[];
  completedTasks: HumanTaskEntry[];
  conductor: {
    serverUrl: string;
    TOKEN: string;
  };
};

const columnRenderer: Record<string, (n: HumanTaskEntry) => ReactNode> = {
  Id: (t: HumanTaskEntry) => t.workflowId!,
  Date: (t: HumanTaskEntry) => formatDate(t.createdOn!),
  "Task Name": (t: HumanTaskEntry) => t.taskName!,
  Status: (t: HumanTaskEntry) => <StatusRenderer state={t.state!} />,
  "": (t: HumanTaskEntry) => (
    <OpenButton
      href={`/loan/${t.workflowId!}`}
      disabled={t.state !== "IN_PROGRESS"}
    >
      Open
    </OpenButton>
  ),
};

export default function MyOrders({ tasks, completedTasks, userId }: Props) {
  const router = useRouter();
  const handleTaskClick = (task: HumanTaskEntry) => {
    router.push(`/loan/${task.workflowId}`);
  };
  return (
    <MainLayout title="Loan Inbox">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Loan Inbox</MainTitle>
        <TaskTable
          tasks={tasks.concat(completedTasks)}
          columns={columnRenderer}
          onSelectTask={handleTaskClick}
        />
      </Stack>
    </MainLayout>
  );
}
