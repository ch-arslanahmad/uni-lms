import FilterDropdown from "../../components/FilterDropdown";
import FilterSelect from "../../components/FilterSelect";
import { SearchInput } from "../../components/SearchInput";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Button } from "../../components/ui/button";
import type { User } from "../../models";
import { Upload } from "lucide-react";
import { useMemo, useState } from "react";

export const UserColumns: Column<User>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
];

export const UserSearchKeys: (keyof User & string)[] = ["name"];

// One filter: which field to filter on, and how to render it.
export interface TableFilter<T> {
  field: keyof T & string;
  variant?: "pills" | "dropdown";
}

export const UserFilters: TableFilter<User>[] = [{ field: "role" }];

// A single filter control. Its options are read from the data,
// so they can never go stale or be listed twice.
function FilterControl<T extends object>({
  filter,
  data,
  value,
  onChange,
}: {
  filter: TableFilter<T>;
  data: T[];
  value: string;
  onChange: (next: string) => void;
}) {
  const options = [
    "all",
    ...[...new Set(data.map((row) => String(row[filter.field] ?? "")))]
      .filter(Boolean)
      .sort(),
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm capitalize text-muted-foreground">
        {filter.field}
      </span>
      {filter.variant === "dropdown" ? (
        <FilterDropdown filters={options} value={value} onChange={onChange} />
      ) : (
        <FilterSelect filters={options} value={value} onChange={onChange} />
      )}
    </div>
  );
}

// Shared table page: Users, Students and Teachers differ only in
// data, columns, search fields and filters.
function UsersPage<T extends object>({
  title,
  data,
  columns,
  searchKeys,
  filters,
}: {
  title: string;
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T & string)[];
  filters: TableFilter<T>[];
}) {
  const [search, setSearch] = useState("");

  // One selected value per filter field; absent means "all".
  // a record used to store field value (department) and stored value in it (CS, EE, etc.) for filtering the table data.
  const [selected, setSelected] = useState<Record<string, string>>({});

  // Every filter must pass (AND), then the query must match one of the search keys.
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter(
      (row) =>
        filters.every((filter) => {
          const value = selected[filter.field] ?? "all"; // "all is default" means no filter for this field.
          return value === "all" || String(row[filter.field]) === value;
        }) &&
        // true if any of the keys match the search query.
        searchKeys.some((key) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(query),
        ),
    );
  }, [data, filters, searchKeys, search, selected]);

  return (
    <div className="flex flex-col min-h-screen p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex flex-wrap items-center align-middle gap-4 py-4">
        <SearchInput value={search} onChange={setSearch} />
        {filters.map((filter) => (
          <FilterControl
            key={filter.field}
            filter={filter}
            data={data}
            value={selected[filter.field] ?? "all"}
            onChange={(next) =>
              setSelected((prev) => ({ ...prev, [filter.field]: next }))
            }
          />
        ))}
        <Button variant="outline" size="sm" className="ml-auto gap-2">
          <Upload size={15} /> Import CSV
        </Button>
      </div>
      <SimpleTable columns={columns} data={rows} paginated={true} />
    </div>
  );
}

export default UsersPage;
