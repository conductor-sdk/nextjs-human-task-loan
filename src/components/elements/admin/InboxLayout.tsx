import { Fragment } from "react";
import { Grid, Stack, Paper, Typography, Box } from "@mui/material";
import { HumanTaskEntry } from "@io-orkes/conductor-javascript";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import StarIcon from "@mui/icons-material/Star";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

type TicketProps = {
  humanTask: HumanTaskEntry;
  onSelectTicket: (ticket: HumanTaskEntry) => void;
  selected: boolean;
};

const Ticket = ({ humanTask, onSelectTicket, selected }: TicketProps) => {
  const { taskName, state, claimedBy } = humanTask;
  const hasNotBeenClaimed = state === "ASSIGNED";
  return (
    <ListItemButton
      alignItems="flex-start"
      onClick={() => onSelectTicket(humanTask)}
      selected={selected}
    >
      <ListItemIcon>
        <StarIcon
          color={hasNotBeenClaimed ? "primary" : "disabled"}
          fontSize="small"
        />
      </ListItemIcon>
      <ListItemAvatar>
        <Avatar alt="Approval" />
      </ListItemAvatar>
      <ListItemText
        primary={taskName}
        secondary={<>{hasNotBeenClaimed ? "" : `Claimed by ${claimedBy}`}</>}
      />
    </ListItemButton>
  );
};

type Props = {
  children: React.ReactNode;
  claimedTasks: HumanTaskEntry[];
  unClaimedTasks: HumanTaskEntry[];
  onSelectTicket: (ticket: HumanTaskEntry) => void;
  selectedTask?: HumanTaskEntry;
};

export const InboxLayout = (props: Props) => {
  const {
    children,
    unClaimedTasks,
    claimedTasks,
    onSelectTicket,
    selectedTask,
  } = props;
  const tasks = unClaimedTasks.concat(claimedTasks);
  return (
    <Paper sx={{ width: "100%", padding: 4, height: "100%" }}>
      <Box mb={2}>
        <Typography variant="h3">Admin Inbox</Typography>
        <Typography variant="caption">
          {tasks.length} Tasks &bull; {unClaimedTasks.length} Un Claimed{" "}
        </Typography>
      </Box>
      <Stack>
        <Grid container sx={{ height: "100%" }}>
          <Grid item xs={3}>
            <Paper variant="outlined" sx={{ height: "100%" }}>
              <List
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
              >
                {tasks.map((task, idx) => (
                  <Fragment key={task.taskId}>
                    <Ticket
                      humanTask={task}
                      onSelectTicket={onSelectTicket}
                      selected={task.taskId === selectedTask?.taskId}
                    />
                    {idx % 2 === 0 ? <Divider component="li" /> : null}
                  </Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={10}>
            <Paper variant="outlined" sx={{ height: "100%", padding: 4 }}>
              {children}
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};
