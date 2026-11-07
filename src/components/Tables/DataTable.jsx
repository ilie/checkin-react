import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../UI/Button";
import { smallControlClasses } from "../UI/Field";

const pageSizes = [5, 10, 15, 25, 50, 100];
const ariaSort = { asc: "ascending", desc: "descending" };

// A table whose rows the API sorts and pages. It shows one page and reports what the user asks for:
// a sort, a page, a page size or a selected row. `meta` is the API's pagination meta.
function DataTable({
  label,
  columns,
  data,
  meta,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  selectedRow,
  onSelect,
  rowClassName,
}) {
  // The React Compiler can't memoize TanStack Table's functions. This app doesn't use the compiler.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    // The API takes one sort, and there's always one.
    enableMultiSort: false,
    enableSortingRemoval: false,
    enableMultiRowSelection: false,
    pageCount: meta.last_page ?? -1,
    rowCount: meta.total,
    state: {
      sorting,
      pagination,
      rowSelection: selectedRow === null ? {} : { [selectedRow]: true },
    },
    onSortingChange,
    onPaginationChange,
  });

  function selectionKeyHandler(event, row) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(row.id);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-[32rem] overflow-auto rounded-[18px] bg-cell">
        <table className="w-full text-left text-mac-body" aria-label={label}>
          <thead className="sticky top-0 z-10 border-b border-sep bg-cell text-label2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const title = flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <th
                      key={header.id}
                      className={`px-3 py-3 font-semibold ${header.column.columnDef.meta?.className ?? ""}`}
                      aria-sort={header.column.getCanSort() ? (ariaSort[header.column.getIsSorted()] ?? "none") : undefined}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="sort-button cursor-pointer rounded font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {title}
                        </button>
                      ) : (
                        title
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                aria-selected={row.getIsSelected()}
                className={`cursor-pointer border-b border-sep/50 last:border-0 hover:bg-fill/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent aria-selected:bg-tint ${rowClassName?.(row.original) ?? ""}`}
                onClick={() => onSelect(row.id)}
                onKeyDown={(event) => selectionKeyHandler(event, row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={`px-3 py-2 ${cell.column.columnDef.meta?.className ?? ""}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-cell px-4 py-3 text-mac-body">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex items-center gap-2 whitespace-nowrap">
            Rows per page
            <select
              aria-label="Rows per page"
              className={smallControlClasses}
              value={pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <span>
            Page {pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <span className="text-label2 max-md:hidden">
            Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total ?? 0} entries
          </span>
        </div>
        {/* A button with nowhere to go is hidden, as the pager always did. */}
        <div className="flex gap-2">
          <Button variant="ghost" className="disabled:hidden" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft className="size-4" aria-hidden="true" /> Previous
          </Button>
          <Button variant="ghost" className="disabled:hidden" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
