import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import { HumanTaskEntry } from "@io-orkes/conductor-javascript";
import { formatDate } from "@/utils/helpers";

type Props = {
  claimedTasks: HumanTaskEntry[];
  unClaimedTasks: HumanTaskEntry[];
  onSelectTask: (task: HumanTaskEntry) => void;
};

export const LoanApprovals = ({ claimedTasks, unClaimedTasks,onSelectTask }: Props) => {
  const tasks = unClaimedTasks.concat(claimedTasks);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Date</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((row) => (
            <TableRow
              key={row.taskId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="right">{formatDate(row.createdOn)}</TableCell>
              <TableCell align="right">{row.state}</TableCell>
              <TableCell align="right">
                <Button fullWidth={false} onClick={()=>onSelectTask(row)}>
                  View/Approve Task
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
