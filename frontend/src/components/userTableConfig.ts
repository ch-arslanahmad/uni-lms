import type { Column } from "./SimpleTable";
import type { User } from "../models";

export const UserColumns: Column<User>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
];

export const UserSearchKeys: (keyof User & string)[] = ["name"];

export interface TableFilter<T> {
  field: keyof T & string;
  variant?: "pills" | "dropdown";
}

export const UserFilters: TableFilter<User>[] = [{ field: "role" }];
