import { useState } from "react";
import { Stack, Box } from "@mui/material";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/elements/buttons/Buttons";
import {
  orkesConductorClient,
  Workflow,
  HumanTaskEntry,
  HumanExecutor,
  HumanTaskTemplate,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript/browser";
import { GetServerSidePropsContext } from "next";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import { findTaskAndClaim, taskDefaultValues } from "../../utils/helpers";
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
  const humanExecutor = new HumanExecutor(client);
  const task = await findTaskAndClaim(
    humanExecutor,
    workflowStatus?.input?.userId,
    executionId
  );
  if (task != null) {
    const template = await client.humanTask.getTemplateByNameAndVersion(
      task?.humanTaskDef?.userFormTemplate?.name!,
      task?.humanTaskDef?.userFormTemplate?.version!
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
  template: HumanTaskTemplate | null;
  conductor: {
    serverUrl: string;
    TOKEN: string;
  };
};

export default function Loan(props: Props) {
  const [formState, setFormState] = useState(taskDefaultValues(props.task));
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

      router.push(`/packet/${props.executionId}`);
    }
  };
  const goBack = async () => {
    if (props?.task?.workflowId != undefined) {
      const { workflowId } = props.task;
      const client = await orkesConductorClient(props.conductor);
      try {
        const wfExecutor = new WorkflowExecutor(client);
        await wfExecutor.goBackToFirstTaskMatchingType(workflowId, "HUMAN");
      } catch (e) {
        console.log(e);
        setShowErrors(true);
      }

      router.push(`/packet/${props.executionId}`);
    }
  };

  const taskIsDooable =
    props.workflowStatus.status === "RUNNING" &&
    props.task != null &&
    props.template != null;

  return (
    <MainLayout title="Document">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        {taskIsDooable ? (
          <>
            <MainTitle>Document</MainTitle>
            <FormDisplay
              template={props.template!}
              formState={formState}
              onFormChange={setFormState}
              displayErrors={showErrors}
            />
            <Stack direction={"row"} spacing={1}>
              <SecondaryButton onClick={goBack}>Back</SecondaryButton>
              <PrimaryButton onClick={completeStep}>Next</PrimaryButton>
            </Stack>
          </>
        ) : (
          <>
            <MainTitle>Document finished</MainTitle>
            <Box>
              <SubText2 paragraph>
                Thank you for submitting the document
              </SubText2>
              <SubText2>You will be notified of any status change.</SubText2>
            </Box>
          </>
        )}
      </Stack>
    </MainLayout>
  );
}
