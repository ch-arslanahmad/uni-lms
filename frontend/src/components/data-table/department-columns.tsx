// Columns for the Departments table, declares WHAT each column is and operations on it (sort/filter).,
// declares the data type of each column, and declares HOW to sort/filter each column.

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "../ui/button";
import type { DataTableFeatures } from "./data-table-features";
import type { DepartmentRow } from "../../models";

export type { DepartmentRow }; // re-export so Dashboard can import from here

const columnHelper = createColumnHelper<DataTableFeatures, DepartmentRow>();

// Defining header columns to sort
export const departmentColumns = columnHelper.columns([
  columnHelper.accessor("code", {
    // Sort button in the header: cycles unsorted → asc → desc → none
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Department Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Department
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  }),
  columnHelper.accessor("courses", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Courses
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  }),
  columnHelper.accessor("accounts", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Accounts
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  }),
]);
