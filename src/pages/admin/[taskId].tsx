import { useState, useMemo } from "react";
import { Stack, Button, } from "@mui/material";
import {
  orkesConductorClient,
  HumanTaskEntry,
  HumanTaskTemplateEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript/browser";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import { FormDisplay } from "@/components/FormDisplay";
import { GetServerSidePropsContext } from "next";
import { PrimaryButton,SecondaryButton } from "@/components/elements/buttons/Buttons"; 
import { MainTitle } from "@/components/elements/texts/Typographys";
import MainLayout from "@/components/MainLayout";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
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
  template,
  selectedTask,
  selectedTaskId,
}: Props) {
  const [formState, setFormState] = useState<
    Record<string, Record<string, any>>
  >(selectedTask?.predefinedInput || {});
  const [error, setError] = useState<boolean>(false);
  console.log("selectedTask", selectedTask);

  const router = useRouter();

  const handleDone = async () => {
    const humanExecutor = new HumanExecutor(
      await orkesConductorClient(conductor)
    );
    try {
      await humanExecutor.completeTask(selectedTask!.taskId!, formState);
      router.push("/admin");
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
      setFormState({});
    } catch (error: any) {
      console.log("error", error);
      setError(true);
    }
  };

  const defaultValues = useMemo(() => {
    return {
      ...(selectedTask?.predefinedInput || {}),
      ...(selectedTask?.output || {}),
    };
  }, [selectedTask]);

  return (
    <MainLayout title="Loan App">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Loan App</MainTitle>
        
          <FormDisplay
            key={selectedTaskId}
            template={template!}
            formState={defaultValues}
            displayErrors={error}
            onFormChange={setFormState}
          />
          <Stack
            width={"100%"}
            direction={"row"}
            justifyContent={"space-between"}
            spacing={2}
            mt={2}
          >
            <SecondaryButton onClick={handleUpdate}>Update</SecondaryButton>
            <PrimaryButton onClick={handleDone}>Done</PrimaryButton>
          </Stack>
      </Stack>
    </MainLayout>
  )
}