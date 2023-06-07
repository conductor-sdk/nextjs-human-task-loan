import { useState, useMemo } from "react";
import { Button, Stack, Typography, Box } from "@mui/material";
import {
  orkesConductorClient,
  Workflow,
  HumanTaskTemplateEntry,
  HumanTaskEntry,
} from "@io-orkes/conductor-javascript";
import { GetServerSidePropsContext } from "next";
import getConfig from "next/config";
import { JsonForms } from "@jsonforms/react";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { useRouter } from "next/navigation";
import { UISchemaElement } from "@jsonforms/core";
import { findTaskAndClaim, findFirstTaskInProgress } from "../helpers";
import { FormDisplay } from "@/components/FormDisplay";

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
    try {
      maybeClaimedTask = await findTaskAndClaim(client, userId);
    } catch (e) {
      console.log(e);
    }
    const task =
      maybeClaimedTask || (await findFirstTaskInProgress(client, userId));

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
        await client.humanTask.updateTaskOutput(
          props.task.taskId,
          formState,
          true
        );
      } catch (e) {
        console.log(e);
        setShowErrors(true);
      }

      router.push(`/test/loan/${props.executionId}`);
    }
  };

  const taskIsDooable =
    props.workflowStatus.status === "RUNNING" &&
    props.task != null &&
    props.template != null;

  return (
    <Stack spacing={2} mt={20} pl={20} pr={20}>
      {taskIsDooable ? (
        <>
          <FormDisplay
            template={props.template!}
            formState={formState}
            onFormChange={setFormState}
            displayErrors={showErrors}
          />
          <Button onClick={completeStep}>Complete</Button>
        </>
      ) : (
        <Box sx={{ margin: "auto" }}>
          <Typography sx={{ color: "red" }}>
            Thanks will let you know shortly
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
