import { useState } from "react";
import { Stack, Box } from "@mui/material";
import { PrimaryButton } from "@/components/elements/buttons/Buttons";
import {
  orkesConductorClient,
  Workflow,
  HumanTaskTemplateEntry,
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";
import { GetServerSidePropsContext } from "next";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import { findTaskAndClaim, findFirstTaskInProgress } from "../../utils/helpers";
import { FormDisplay } from "@/components/FormDisplay";
import MainLayout from "@/components/MainLayout";
import { MainTitle, SubText2 } from "@/components/elements/texts/Typographys";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  const executionId = context.params?.executionId as string;
  const workflowStatus = await client.workflowResource.getExecutionStatus(
    executionId
  );

  const taskInProgress = (workflowStatus.tasks || []).filter(
    ({ status, taskType }) => status === "IN_PROGRESS" && taskType === "HUMAN"
  );
  if (taskInProgress.length > 0) {
    // Assert Workflow is waiting on human task
    const userId = workflowStatus?.input?.userId as string;
    let maybeClaimedTask: HumanTaskEntry | null = null;
    const executor = new HumanExecutor(client);
    try {
      maybeClaimedTask = await findTaskAndClaim(executor, userId);
    } catch (e) {
      console.log(e);
    }
    const task =
      maybeClaimedTask || (await findFirstTaskInProgress(executor, userId));

    if (task?.templateId != undefined) {
      const template = await client.humanTask.getTemplateById(
        task!.templateId!
      );

      return {
        props: {
          executionId,
          workflowStatus,
          task,
          template,
          conductor: {
            serverUrl: publicRuntimeConfig.conductor.serverUrl,
            TOKEN: client.token,
          },
        },
      };
    }
  }
  return {
    props: {
      executionId,
      workflowStatus,
      task: null,
      template: null,
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
    },
  };
}

type Props = {
  executionId: string;
  workflowStatus: Workflow;
  task: HumanTaskEntry | null;
  template: HumanTaskTemplateEntry | null;
  conductor: {
    serverUrl: string;
    TOKEN: string;
  };
};

export default function Loan(props: Props) {
  const [formState, setFormState] = useState(props.task?.predefinedInput || {});
  const [showErrors, setShowErrors] = useState(false);
  const router = useRouter();
  const completeStep = async () => {
    if (props?.task?.taskId != undefined) {
      const client = await orkesConductorClient(props.conductor);
      try {
        const executor = new HumanExecutor(client);
        await executor.completeTask(props.task.taskId, formState);
      } catch (e) {
        console.log(e);
        setShowErrors(true);
      }

      router.push(`/loan/${props.executionId}`);
    }
  };

  const taskIsDooable =
    props.workflowStatus.status === "RUNNING" &&
    props.task != null &&
    props.template != null;

  return (
    <MainLayout title="Most Trusted">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        {taskIsDooable ? (
          <>
            <MainTitle>Most Trusted</MainTitle>
            <FormDisplay
              template={props.template!}
              formState={formState}
              onFormChange={setFormState}
              displayErrors={showErrors}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
              width="100%"
            >
              <PrimaryButton onClick={completeStep}>Next</PrimaryButton>
            </Box>
          </>
        ) : (
          <>
            <MainTitle>Student Loan Application</MainTitle>
            <Box>
              <SubText2 paragraph>
                Thank you for filling our application!
              </SubText2>
              <SubText2>You will be notified of any status change.</SubText2>
            </Box>
          </>
        )}
      </Stack>
    </MainLayout>
  );
}
