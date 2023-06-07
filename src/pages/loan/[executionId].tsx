import Head from "next/head";
import { useState } from "react";
import { Button, Stack, Typography, Box, Paper } from "@mui/material";
import {
  orkesConductorClient,
  Workflow,
  HumanTaskTemplateEntry,
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";
import { GetServerSidePropsContext } from "next";
import getConfig from "next/config";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/navigation";
import { findTaskAndClaim, findFirstTaskInProgress } from "../../utils/helpers";
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
    <>
      <Head>
        <title>Loan Approval</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Paper sx={{ padding: 20 }}>
          <Stack spacing={2} >
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
                <Button onClick={() => router.push("/")}>Go Home</Button>
              </Box>
            )}
          </Stack>
        </Paper>
      </main>
    </>
  );
}
