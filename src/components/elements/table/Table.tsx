import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Paper, Typography } from "@mui/material";
import { HumanTaskEntry } from "@io-orkes/conductor-javascript";
import { styled } from "@mui/material/styles";
import { ReactNode } from "react";

type TaskState =
  | "ASSIGNED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "PENDING"
  | "TIMED_OUT";

const stateToColor = (state: TaskState) => {
  switch (state) {
    case "ASSIGNED":
      return "#FCA729";
    case "COMPLETED":
      return "#5AD4A1";
    case "IN_PROGRESS":
      return "#FCA729";
    default:
      return "#FCA729";
  }
};

const StatusRendererContainer = styled("div")<{ state: TaskState }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 13px;
  gap: 10px;
  width: 105px;
  height: 22px;

  background: ${({ state }) => stateToColor(state)};
  border-radius: 10px;
`;

export const StatusRenderer = ({ state }: { state: TaskState }) => {
  return (
    <StatusRendererContainer state={state}>
      <Typography
        variant="caption"
        sx={{
          fontSize: "12px",
          color: "#F1F6F7",
          fontWeight: "400",
          textAlign: "center",
          textTransform: "capitalize",
        }}
      >
        {state.toLocaleLowerCase()}
      </Typography>
    </StatusRendererContainer>
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: "#172D34",
    fontSize: 14,
    lineHeight: "17px",
    letterSpacing: "-0.02em",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    lineHeight: "17px",
    fontWeight: 400,
    color: "#05315B",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F1F6F7",
    borderRadius: "2px",
    height: "46px",
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    backgroundColor: "#FFFFFF",
    borderRadius: "2px",
    height: "46px",
  },
}));

type Props = {
  columns: Record<string, (n: HumanTaskEntry) => ReactNode>;
  tasks: HumanTaskEntry[];
};

export const TaskTable = ({ columns, tasks }: Props) => {
  const columnNames = Object.keys(columns);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            {columnNames.map((name) => (
              <StyledTableCell align="left" key={name}>
                {name}
              </StyledTableCell>
            ))}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {tasks.map((row) => (
            <StyledTableRow
              key={row.taskId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {columnNames.map((name) => {
                const column = columns[name];
                return (
                  <StyledTableCell align="left" key={name}>
                    {column(row)}
                  </StyledTableCell>
                );
              })}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
