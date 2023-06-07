import { useState } from "react";
import { Stack, Button } from "@mui/material";
import { InboxLayout } from "@/components/elements/admin/InboxLayout";
import {
  orkesConductorClient,
  HumanTaskEntry,
  HumanTaskTemplateEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import {
  assignTaskAndClaim,
  getClaimedAndUnClaimedTasksForAssignee,
} from "../../utils/helpers";
import { FormDisplay } from "@/components/FormDisplay";
import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  const humanExecutor = new HumanExecutor(client);
  const { claimedTasks, unClaimedTasks } =
    await getClaimedAndUnClaimedTasksForAssignee(
      humanExecutor,
      "approval-interim-group"
    );
  const selectedTaskId = context.params?.taskId as string;
  if (selectedTaskId) {
    const selectedTask = await client.humanTask.getTask1(selectedTaskId);

    const template = await client.humanTask.getTemplateById(
      selectedTask!.templateId!
    );

    return {
      props: {
        conductor: {
          serverUrl: publicRuntimeConfig.conductor.serverUrl,
          TOKEN: client.token,
        },
        workflows: publicRuntimeConfig.workflows,
        correlationId: publicRuntimeConfig.workflows.correlationId,
        claimedTasks,
        unClaimedTasks,
        selectedTask,
        selectedTaskId: selectedTaskId,
        template,
      },
    };
  }

  // With the client pull the workflow with correlationId (correlation id is not really needed it just helps to group orders together)
  return {
    props: {
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
      workflows: publicRuntimeConfig.workflows,
      correlationId: publicRuntimeConfig.workflows.correlationId,
      claimedTasks,
      unClaimedTasks,
      selectedTask: null,
      template: null,
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
  claimedTasks: HumanTaskEntry[];
  unClaimedTasks: HumanTaskEntry[];
  selectedTask: HumanTaskEntry | null;
  template: HumanTaskTemplateEntry | null;
  selectedTaskId: string;
};

export default function Test({
  conductor,
  claimedTasks,
  unClaimedTasks,
  template,
  selectedTask,
  selectedTaskId,
}: Props) {
  const [formState, setFormState] = useState<
    Record<string, Record<string, any>>
  >(selectedTask?.predefinedInput || {});
  const [error, setError] = useState<boolean>(false);

  const router = useRouter();

  const handleSelectTask = async (selectedTask: HumanTaskEntry) => {
    const { taskId, state } = selectedTask;
    let task = selectedTask;

    const client = await orkesConductorClient(conductor);
    if (state === "ASSIGNED") {
      try {
        const humanExecutor = new HumanExecutor(client);
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
    router.replace(`/admin/${task.taskId}`);
  };

  const handleDone = async () => {
    const humanExecutor = new HumanExecutor(
      await orkesConductorClient(conductor)
    );
    try {
      await humanExecutor.completeTask(selectedTask!.taskId!, formState);
      router.push("/admin");
      console.log("Completed task");
      setFormState({});
    } catch (error: any) {
      console.log("error", error);
      setError(true);
    }
  };

  const handleUpdate = async () => {
    const humanExecutor = new HumanExecutor(
      await orkesConductorClient(conductor)
    );
    try {
      await humanExecutor.updateTaskOutput(selectedTask!.taskId!, formState);
      router.push("/admin");
      console.log("Task updated");
      setFormState({});
    } catch (error: any) {
      console.log("error", error);
      setError(true);
    }
  };

  return (
    <InboxLayout
      unClaimedTasks={unClaimedTasks}
      claimedTasks={claimedTasks}
      onSelectTicket={handleSelectTask}
      selectedTask={selectedTask!}
    >
      <FormDisplay
        key={selectedTaskId}
        template={template!}
        formState={selectedTask?.predefinedInput || {}}
        displayErrors={error}
        onFormChange={setFormState}
      />
      <Stack
        width={"100%"}
        direction={"row"}
        justifyContent={"space-between"}
        mt={2}
      >
        <Button onClick={handleDone}>Done</Button>
        <Button onClick={handleUpdate}>Update</Button>
      </Stack>
    </InboxLayout>
  );
}
