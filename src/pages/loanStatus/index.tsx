import { useMemo, useCallback } from "react";
import {
  orkesConductorClient,
  WorkflowExecutor,
  WorkflowSummary,
} from "@io-orkes/conductor-javascript/browser";

import { MainTitle } from "@/components/elements/texts/Typographys";
import MainLayout from "@/components/MainLayout";
import { Stack } from "@mui/material";
import getConfig from "next/config";
import { useRouter } from "next/navigation";
import {
  formatDate,
  assignTaskAndClaim,
  getClaimedAndUnClaimedTasksForAssignee,
} from "../../utils/helpers";
import {
  WorkflowSummaryTable,
  StatusRenderer,
  ValueRenderers,
} from "@/components/elements/table/WorkflowSummaryTable";
import { OpenButton } from "@/components/elements/buttons/Buttons";

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client = await clientPromise;
  const workflowExecutor = new WorkflowExecutor(client);
  const executions = await workflowExecutor.search(
    0, // we should add pagination with this TODO
    100,
    `correlationId IN (${publicRuntimeConfig.workflows.correlationId})`,
    ""
  );

  return {
    props: {
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
      workflows: publicRuntimeConfig.workflows,
      correlationId: publicRuntimeConfig.workflows.correlationId,
      executions: executions.results,
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
  executions: WorkflowSummary[];
};

const columnRenderer: ValueRenderers = {
  Date: {
    renderer: (t: WorkflowSummary) => t.startTime!,
    sortId: "startTime",
  },
  Id: {
    renderer: (t: WorkflowSummary) => t.workflowId!,
    sortId: "workflowId",
  },
  "Loan Type": {
    renderer: (t: WorkflowSummary) => t.input!.loanType! as string,
  },
  Amount: {
    renderer: (t: WorkflowSummary) => t.input!.amount! as string,
  },
  Status: {
    renderer: (t: WorkflowSummary) => "Implement me",
  },
};

export default function Admin({
  conductor,
  executions,
}: Props) {
  const router = useRouter();
  return (
    <MainLayout title="Loan Inbox">
      <Stack spacing={6} justifyContent={"center"} alignItems={"center"}>
        <MainTitle>Loan Inbox</MainTitle>
        <WorkflowSummaryTable executions={executions} columns={columnRenderer} />
      </Stack>
    </MainLayout>
  );
}
