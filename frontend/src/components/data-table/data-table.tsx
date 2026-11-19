// This defines the TanStack Table component for displaying data in a table format with sorting and filtering capabilities.

import * as React from "react";
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";

import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { features, type DataTableFeatures } from "./data-table-features";

// Modifies generic RowData of TanStack table (functionality) to include our features (filtering + sorting) so we can type the columns and rows.
interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  searchColumn?: string; // column id to filter on, e.g. "name"
  searchPlaceholder?: string;
}

// Bridge between TanStack Table and shadcn/ui Table. This is the main component that renders the table with search and sorting capabilities.
export function DataTable<TData extends RowData>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Search...",
}: DataTableProps<TData>) {
  // state handling via TanStack
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // table instance with features (filtering + sorting) and state management (TanStack)
  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Shadcn/ui custom table with Tanstack
  return (
    <div>
      {/* the search input */}{" "}
      {searchColumn && (
        <div className="flex items-center pb-2">
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-12/12"
          />
        </div>
      )}
      {/*  the table itself (shadcn markup + TanStack answers) */}
      <div className="overflow-hidden rounded-md border bg-card">
        <Table>
          {/* Headers: FlexRender handles string OR custom node (sort button) */}
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* getRowModel() = rows AFTER filter + sort; slice caps at 10 (no pagination) */}
            {table.getRowModel().rows?.length ? (
              table
                .getRowModel()
                .rows.slice(0, 10)
                .map((row) => (
                  <TableRow key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : (
              /* Empty state — colSpan spans all columns so text centers */
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
