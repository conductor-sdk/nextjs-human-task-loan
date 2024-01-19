import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { Paper, Typography, Box } from "@mui/material";
import { HumanTaskEntry } from "@io-orkes/conductor-javascript";
import { styled } from "@mui/material/styles";
import { ReactNode, useState, useMemo } from "react";
import { visuallyHidden } from "@mui/utils";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

type TaskState =
  | "ASSIGNED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "PENDING"
  | "DELETED"
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

type ValRendererSorter = {
  renderer: (n: HumanTaskEntry) => ReactNode;
  sortId?: keyof HumanTaskEntry;
};

export type ValueRenderers = Record<string, ValRendererSorter>;

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

function descendingComparator<T>(a: T, b: T, orderBy?: keyof T) {
  if (orderBy === undefined) return 0;
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy?: Key
): (a: { [key in Key]?: any }, b: { [key in Key]?: any }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof HumanTaskEntry
  ) => void;
  order: Order;
  orderBy: string;
  columnRenderers: ValueRenderers;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort, columnRenderers } = props;
  const columns = Object.keys(columnRenderers);

  const createSortHandler =
    (property: keyof HumanTaskEntry) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {columns.map((c) => (
          <StyledTableCell
            key={c}
            align={"left"}
            {...(columnRenderers[c].sortId != null
              ? {
                  sortDirection:
                    orderBy === columnRenderers[c].sortId ? order : false,
                }
              : {})}
          >
            <TableSortLabel
              active={orderBy === columnRenderers[c].sortId}
              direction={orderBy === columnRenderers[c].sortId ? order : "asc"}
              IconComponent={KeyboardArrowDownIcon}
              {...(columnRenderers[c].sortId != null
                ? { onClick: createSortHandler(columnRenderers[c].sortId!) }
                : {})}
            >
              {c}
              {orderBy === columnRenderers[c].sortId ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

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

type Props = {
  columns: ValueRenderers;
  tasks: HumanTaskEntry[];
};

export const TaskTable = ({ columns, tasks }: Props) => {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof HumanTaskEntry>("taskId");
  const columnNames = Object.keys(columns);
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof HumanTaskEntry
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const visibleRows = useMemo(
    () => tasks.sort(getComparator(order, orderBy)),
    [order, orderBy, tasks]
  );
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <EnhancedTableHead
          columnRenderers={columns}
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {visibleRows.map((row) => (
            <StyledTableRow
              key={row.taskId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {columnNames.map((name) => {
                const column: ValRendererSorter = columns[name];
                return (
                  <StyledTableCell align="left" key={name}>
                    {column.renderer(row)}
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
