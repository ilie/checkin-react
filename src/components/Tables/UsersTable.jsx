import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "./DataTable";

const column = createColumnHelper();
const onDesktop = { className: "max-md:hidden" };

// Users can only be sorted by name.
const columns = [
  column.accessor("name", { header: "Name" }),
  column.accessor("nif", { header: "NIF", enableSorting: false, meta: onDesktop }),
  column.accessor("email", { header: "Email", enableSorting: false }),
  column.accessor("hours_on_contract", {
    header: "Contract",
    enableSorting: false,
    cell: (info) => `${info.getValue()} h`,
    meta: onDesktop,
  }),
  column.accessor("is_admin", {
    header: "Admin",
    enableSorting: false,
    cell: (info) => (info.getValue() ? "Yes" : "No"),
    meta: { className: "text-right max-md:hidden" },
  }),
];

function UsersTable(props) {
  return <DataTable label="Users" columns={columns} {...props} />;
}

export default UsersTable;
