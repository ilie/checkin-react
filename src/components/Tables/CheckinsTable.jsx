import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "./DataTable";
import Tag from "../UI/Tag";
import { formatDateToES, getFormattedTimeDiff } from "../../helpers/formatters";

const column = createColumnHelper();

function workingTime(row) {
  if (!row.checkout_time) return "Open";
  const start = new Date(`${row.checkin_date}T${row.checkin_time}`);
  const end = new Date(`${row.checkin_date}T${row.checkout_time}`);

  return end <= start ? "Invalid" : getFormattedTimeDiff(start, end);
}

// Column ids match the API's sort fields. Only user_id and checkin_date can be sorted.
const columns = [
  column.accessor("user_name", {
    id: "user_id",
    header: "Name",
    cell: ({ row }) => (
      <>
        {row.original.user_name}
        {row.original.source === "manual" && <Tag>Manual</Tag>}
        {row.original.corrections_count > 0 && <Tag>Edited ×{row.original.corrections_count}</Tag>}
        {row.original.deleted_at && <Tag>Deleted</Tag>}
      </>
    ),
  }),
  column.accessor("checkin_date", {
    header: "Date",
    sortDescFirst: true,
    cell: (info) => formatDateToES(info.getValue()),
  }),
  column.accessor("checkin_time", { header: "Check in", enableSorting: false }),
  column.accessor("checkout_time", { header: "Check out", enableSorting: false }),
  column.accessor(workingTime, {
    id: "working_time",
    header: "Working time",
    enableSorting: false,
    meta: { className: "text-right max-md:hidden" },
  }),
];

function deletedRowClass(row) {
  return row.deleted_at ? "text-gray-400 line-through" : "";
}

function CheckinsTable(props) {
  return <DataTable label="Check-ins" columns={columns} rowClassName={deletedRowClass} {...props} />;
}

export default CheckinsTable;
