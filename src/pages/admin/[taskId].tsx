import Head from "next/head";
import { useState, useMemo } from "react";
import { Stack, Button, Box, Paper } from "@mui/material";
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
import styles from "@/styles/Home.module.css";

import { MainTitle } from "@/components/elements/texts/Typographys";
import MainLayout from "@/components/MainLayout";
import {
  TaskTable,
  StatusRenderer,
} from "@/components/elements/table/Table";
import { ReactNode } from "react";
import { OpenButton } from "@/components/elements/buttons/Buttons";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  const humanExecutor = new HumanExecutor(client);
  /* const { claimedTasks, unClaimedTasks } = */
  /*   await getClaimedAndUnClaimedTasksForAssignee( */
  /*     humanExecutor, */
  /*     "approval-interim-group" */
  /*   ); */
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

  const router = useRouter();

  /* const handleSelectTask = async (selectedTask: HumanTaskEntry) => { */
  /*   const { taskId, state } = selectedTask; */
  /*   let task = selectedTask; */
  /**/
  /*   const client = await orkesConductorClient(conductor); */
  /*   if (state === "ASSIGNED") { */
  /*     try { */
  /*       const humanExecutor = new HumanExecutor(client); */
  /*       const claimedTask = await assignTaskAndClaim( */
  /*         humanExecutor, */
  /*         taskId!, */
  /*         "admin" */
  /*       ); */
  /**/
  /*       task = claimedTask; */
  /*     } catch (error: any) { */
  /*       console.log("error", error); */
  /*     } */
  /*   } */
  /*   router.replace(`/admin/${task.taskId}`); */
  /* }; */

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
            mt={2}
          >
            <Button onClick={handleDone}>Done</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </Stack>
      </Stack>
    </MainLayout>
  )
}
// (
//     <>
//       <Head>
//         <title>Loan Approval</title>
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//
//       <main className={styles.main}>
//         <Paper sx={{ padding: 20 }}>
//           <FormDisplay
//             key={selectedTaskId}
//             template={template!}
//             formState={defaultValues}
//             displayErrors={error}
//             onFormChange={setFormState}
//           />
//           <Stack
//             width={"100%"}
//             direction={"row"}
//             justifyContent={"space-between"}
//             mt={2}
//           >
//             <Button onClick={handleDone}>Done</Button>
//             <Button onClick={handleUpdate}>Update</Button>
//           </Stack>
//         </Paper>
//       </main>
//     </>
//   )