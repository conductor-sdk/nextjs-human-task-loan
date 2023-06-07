import {
  ConductorClient,
  HumanTaskEntry,
} from "@io-orkes/conductor-javascript";

export const humanTaskList = async (
  client: ConductorClient,
  assignee: string,
  status: "IN_PROGRESS" | "ASSIGNED"| "COMPLETED" = "IN_PROGRESS"
): Promise<HumanTaskEntry[]> => {
  const response = await client.humanTask.getTasksByFilter(status, assignee);
  if (response.results != undefined) {
    return response.results;
  }
  return [];
};

export const assignTaskAndClaim = async (
  client: ConductorClient,
  taskId: string,
  assignee: string
): Promise<HumanTaskEntry> => {
  await client.humanTask.assignAndClaim(taskId!, assignee);
  return await client.humanTask.getTask1(taskId!);
};

export const findTaskAndClaim = async (
  client: ConductorClient,
  assignee: string
): Promise<HumanTaskEntry | null> => {
  const tasks = await humanTaskList(client, assignee, "ASSIGNED");
  if (tasks.length > 0) {
    const taskId = tasks[0]!.taskId;
    return await assignTaskAndClaim(client, taskId!, assignee); 
  }
  return null;
};

export const findFirstTaskInProgress = async (
  client: ConductorClient,
  assignee: string
): Promise<HumanTaskEntry | null> => {
  const tasks = await humanTaskList(client, assignee, "IN_PROGRESS");
  if (tasks.length > 0) {
    const task = tasks[0];
    return task;
  }
  return null;
};
