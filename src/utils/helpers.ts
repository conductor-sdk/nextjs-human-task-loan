import {
  HumanTaskEntry,
  HumanExecutor,
} from "@io-orkes/conductor-javascript/browser";
import { format } from "date-fns";

export const assignTaskAndClaim = async (
  executor: HumanExecutor,
  taskId: string,
  assignee: string
): Promise<HumanTaskEntry> => {
  return await executor.claimTaskAsExternalUser(taskId!, assignee);
};

export const findTasks = async (
  executor: HumanExecutor,
  assignee: string,
  packet?: string
): Promise<HumanTaskEntry[]> => {
  const tasks = await executor.pollSearch({
    states: ["ASSIGNED", "IN_PROGRESS"],
    assignees: [{ userType: "EXTERNAL_USER", user: assignee }],
    ...(packet != null ? { taskInputQuery: `packet = "${packet}"` } : {}),
  });
  return tasks;
};

export const findTaskAndClaim = async (
  executor: HumanExecutor,
  assignee: string,
  packet: string
): Promise<HumanTaskEntry | null> => {
  const tasks = await findTasks(executor, assignee, packet);
  if (tasks.length > 0) {
    const [firstTask] = tasks;
    if (firstTask.state === "IN_PROGRESS") {
      return executor.getTaskById(firstTask.taskId!);
    }
    const taskId = firstTask!.taskId;

    return await assignTaskAndClaim(executor, taskId!, assignee);
  }
  return null;
};

export const findFirstTaskInProgress = async (
  executor: HumanExecutor,
  assignee: string
): Promise<HumanTaskEntry | null> => {
  const tasks = await executor.search({
    states: ["IN_PROGRESS"],
    assignees: [{ userType: "EXTERNAL_USER", user: assignee }],
  });
  if (tasks.length > 0) {
    const task = tasks[0];
    return task;
  }
  return null;
};

export const getClaimedAndUnClaimedTasksForAssignee = async (
  humanExecutor: HumanExecutor
): Promise<HumanTaskEntry[]> => {
  const tasks = await humanExecutor.search({
    states: ["IN_PROGRESS", "ASSIGNED"],
  });

  return tasks;
};

export const formatDate = (timestamp?: number): string => {
  if (!timestamp) {
    return "";
  }
  const dateObject = new Date(timestamp);
  const prettyDate = format(dateObject, "dd/MM/yyyy");
  return prettyDate;
};

export const omitStartsWithUnderscore = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith("_")));

export const taskDefaultValues = (maybeTask?: HumanTaskEntry | null) => ({
  ...omitStartsWithUnderscore(maybeTask?.input || {}),
  ...(maybeTask?.output || {}),
});
