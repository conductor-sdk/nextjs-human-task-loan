import { InboxLayout } from "@/components/elements/admin/InboxLayout";
import {
  orkesConductorClient,
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import {
  assignTaskAndClaim,
  getClaimedAndUnClaimedTasksForAssignee,
} from "../helpers";

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
    <InboxLayout
      unClaimedTasks={unClaimedTasks}
      claimedTasks={claimedTasks}
      onSelectTicket={handleSelectTask}
    >
      {null}
    </InboxLayout>
  );
}
