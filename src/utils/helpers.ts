import {
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript";
import { format } from "date-fns";

export const assignTaskAndClaim = async (
  executor: HumanExecutor,
  taskId: string,
  assignee: string
): Promise<HumanTaskEntry> => {
  await executor.claimTaskAsExternalUser(taskId!, assignee);
  return await executor.getTaskById(taskId!);
};

export const findTaskAndClaim = async (
  executor: HumanExecutor,
  assignee: string
): Promise<HumanTaskEntry | null> => {
  const tasks = await executor.getTasksByFilter("ASSIGNED", assignee);
  if (tasks.length > 0) {
    const taskId = tasks[0]!.taskId;
    return await assignTaskAndClaim(executor, taskId!, assignee);
  }
  return null;
};

export const findFirstTaskInProgress = async (
  executor: HumanExecutor,
  assignee: string
): Promise<HumanTaskEntry | null> => {
  const tasks = await executor.getTasksByFilter("IN_PROGRESS", assignee);
  if (tasks.length > 0) {
    const task = tasks[0];
    return task;
  }
  return null;
};

export const getClaimedAndUnClaimedTasksForAssignee = async (
  humanExecutor: HumanExecutor,
  assignee: string
): Promise<{
  claimedTasks: HumanTaskEntry[];
  unClaimedTasks: HumanTaskEntry[];
}> => {
  const claimedTasks = await humanExecutor.getTasksByFilter(
    "IN_PROGRESS",
    assignee
  );
  const unClaimedTasks = await humanExecutor.getTasksByFilter(
    "ASSIGNED",
    assignee
  );
  return { claimedTasks, unClaimedTasks };
};


export const formatDate = (timestamp?: number): string => {
  if (!timestamp) {
    return "";
  }
  const dateObject = new Date(timestamp);
  const prettyDate = format(dateObject, "dd/MM/yyyy");
  return prettyDate;
};