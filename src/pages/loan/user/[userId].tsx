import { Stack } from "@mui/material";
import getConfig from "next/config";
import {
  orkesConductorClient,
  HumanTaskEntry,
  ConductorClient,
  HumanExecutor,
} from "@io-orkes/conductor-javascript/browser";
import { GetServerSidePropsContext } from "next";
import {
  TaskTable,
  StatusRenderer,
  ValueRenderers,
} from "@/components/elements/table/HumanTaskEntryTable";
import { MainTitle } from "@/components/elements/texts/Typographys";
import _path from "lodash/fp/path";
import { formatDate } from "@/utils/helpers";
import MainLayout from "@/components/MainLayout";

import { OpenButton } from "@/components/elements/buttons/Buttons";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client: ConductorClient = await clientPromise;
  const userId = context.params?.userId as string;
  const humanExecutor = new HumanExecutor(client);
  const tasks = await humanExecutor.search({
    states: ["IN_PROGRESS"],
    assignees: [{ userType: "EXTERNAL_USER", user: userId }],
  });
  const completedTasks = await humanExecutor.search({
    states: ["COMPLETED"],
    assignees: [{ userType: "EXTERNAL_USER", user: userId }],
  });

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

const columnRenderer: ValueRenderers = {
  Id: {
    renderer: (t: HumanTaskEntry) => t.workflowId!,
    sortId: "workflowId",
  },
  Date: {
    renderer: (t: HumanTaskEntry) => formatDate(t.createdOn!),
    sortId: "createdOn",
  },
  "Task Name": {
    renderer: (t: HumanTaskEntry) => t.taskRefName!,
    sortId: "taskRefName",
  },
  Status: {
    renderer: (t: HumanTaskEntry) => <StatusRenderer state={t.state!} />,
    sortId: "state",
  },
  "": {
    renderer: (t: HumanTaskEntry) => (
      <OpenButton
        href={`/loan/${t.workflowId!}`}
        disabled={t.state !== "IN_PROGRESS"}
      >
        Open
      </OpenButton>
    ),
  },
};

export default function MyOrders({ tasks, completedTasks, userId }: Props) {
  return (
    <MainLayout title="Loan Inbox">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Loan Inbox</MainTitle>
        <TaskTable
          tasks={tasks.concat(completedTasks)}
          columns={columnRenderer}
        />
      </Stack>
    </MainLayout>
  );
}
