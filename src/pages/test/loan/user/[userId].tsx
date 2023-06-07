import Head from "next/head";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Stack } from "@mui/material";
import Paper from "@mui/material/Paper";
import getConfig from "next/config";
import {
  orkesConductorClient,
  HumanTaskEntry,
  ConductorClient,
} from "@io-orkes/conductor-javascript";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { findTaskAndClaim, humanTaskList } from "../../helpers";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { publicRuntimeConfig } = getConfig();
  const clientPromise = orkesConductorClient(publicRuntimeConfig.conductor);
  const client: ConductorClient = await clientPromise;
  const userId = context.params?.userId as string;

  const tasks = await humanTaskList(client, userId, "IN_PROGRESS");

  const completedTasks = await humanTaskList(client, userId, "COMPLETED");

  // Assert Workflow is waiting on human task
  return {
    props: {
      userId,
      tasks,
      completedTasks,
      conductor: {
        serverUrl: publicRuntimeConfig.conductor.serverUrl,
        TOKEN: client.token,
      },
    },
  };
}

type Props = {
  userId: string;
  tasks: HumanTaskEntry[];
  completedTasks: HumanTaskEntry[];
  conductor: {
    serverUrl: string;
    TOKEN: string;
  };
};

export default function MyOrders({ tasks, completedTasks }: Props) {
  return (
    <>
      <Head>
        <title>User Tasks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Stack spacing={2}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell align="right">Date</TableCell>
                  <TableCell align="right">Task Name</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.concat(completedTasks).map((row) => (
                  <TableRow
                    key={row.workflowId}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.state === "COMPLETED" ? (
                        row.workflowId
                      ) : (
                        <Link href={`/test/loan/${row.workflowId}`}>
                          {row.workflowId}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell align="right">{row.createdOn}</TableCell>
                    <TableCell align="right">{row.taskName}</TableCell>
                    <TableCell align="right">{row.state}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </main>
    </>
  );
}
