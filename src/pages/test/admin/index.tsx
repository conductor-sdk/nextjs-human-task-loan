import { InboxLayout } from "@/components/elements/admin/InboxLayout";
import {
  orkesConductorClient,
  HumanTaskEntry,
} from "@io-orkes/conductor-javascript";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import { assignTaskAndClaim, humanTaskList } from "../helpers";

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  const claimedTasks = await humanTaskList(
    client,
    "approval-interim-group",
    "IN_PROGRESS"
  );
  const unClaimedTasks = await humanTaskList(
    client,
    "approval-interim-group",
    "ASSIGNED"
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

    const client = await orkesConductorClient(conductor);
    if (state === "ASSIGNED") {
      try {
        const claimedTask = await assignTaskAndClaim(client, taskId!, "admin");

        task = claimedTask;
      } catch (error: any) {
        console.log("error", error);
      }
    }
    router.push(`/test/admin/${task.taskId}`);
  };

  return (
    <InboxLayout
      unClaimedTasks={unClaimedTasks}
      claimedTasks={claimedTasks}
      onSelectTicket={handleSelectTask}
    >
      {null}
    </InboxLayout>
  );
}
