import { useMemo, useCallback } from "react";
import {
  orkesConductorClient,
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript/browser";

import { MainTitle } from "@/components/elements/texts/Typographys";
import MainLayout from "@/components/MainLayout";
import { Stack } from "@mui/material";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import {
  formatDate,
  getClaimedAndUnClaimedTasksForAssignee,
} from "../../utils/helpers";
import {
  TaskTable,
  StatusRenderer,
  ValueRenderers,
} from "@/components/elements/table/HumanTaskEntryTable";
import { OpenButton } from "@/components/elements/buttons/Buttons";

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  const humanExecutor = new HumanExecutor(client);

  const tasks = await getClaimedAndUnClaimedTasksForAssignee(
    humanExecutor,
  );
  // With the client pull the workflow with correlationId (correlation id is not really needed it just helps to group orders together)
  return {
    props: {
      // conductor: {
      //   serverUrl: publicRuntimeConfig.conductor.serverUrl,
      //   TOKEN: client.token,
      // },
      workflows: publicRuntimeConfig.workflows,
      correlationId: publicRuntimeConfig.workflows.correlationId,
      tasks,
    },
  };
}

type Props = {
  // conductor: {
  //   serverUrl: string;
  //   TOKEN: string;
  // };
  workflows: Record<string, string>;
  correlationId: string;
  tasks: HumanTaskEntry[];
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
    renderer: (t: HumanTaskEntry) => t.taskRefName!,
    sortId: "taskRefName",
  },
  "Assignee":{
    renderer: (t: HumanTaskEntry) => t.assignee!.user!,
    sortId: "assignee",
  },
  Status: {
    renderer: (t: HumanTaskEntry) => <StatusRenderer state={t.state!} />,
    sortId: "state",
  },
};

export default function Admin({
  tasks
}: Props) {
  const router = useRouter();
  const handleSelectTask = useCallback(
    async (selectedTask: HumanTaskEntry) => {
      console.log(selectedTask);

      router.push(`/packet/${selectedTask?.input?.packet}`);
    },
    [router]
  );
  const columnsWithContext = useMemo(() => {
    return {
      ...columnRenderer,
      Open: {
        renderer: (t: HumanTaskEntry) => (
          <OpenButton onClick={() => handleSelectTask(t)}>Open</OpenButton>
        ),
      },
      Kill: {
        renderer: (t: HumanTaskEntry) => (
          <OpenButton onClick={() => handleSelectTask(t)}>Kill</OpenButton>
        ),
      },
    };
  }, [handleSelectTask]);

  return (
    <MainLayout title="Open packets">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Open Packets</MainTitle>
        <TaskTable tasks={tasks} columns={columnsWithContext} />
      </Stack>
    </MainLayout>
  );
}
