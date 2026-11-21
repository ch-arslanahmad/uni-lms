import FilterSelect from "../../components/FilterSelect";
import Filter from "../../components/FilterSelect";
import { SearchInput } from "../../components/SearchInput";
import { SimpleTable, type Column } from "../../components/SimpleTable";
import { Role, users, type User } from "../../models";
import { useState, useMemo } from "react";

const UserColumns: Column<User>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
];

function UsersPage({
  filters = ["all", ...Object.values(Role)], // first object would be
  searchKeys = ["name"],
}: {
  filters?: string[];
  searchKeys?: (keyof User & string)[];
}) {
  type RoleTab = (typeof filters)[number];

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<RoleTab>("all");

  const filtered = users.filter((u) => tab === "all" || u.role === tab);

  // FILTER, search matches the given fields
  const searched = useMemo(() => {
    const query = search.trim().toLowerCase();
    const keys = searchKeys ?? UserColumns.map((column) => column.key); // we do search on the following attribute (column)
    return filtered.filter((row) =>
      keys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [filtered, searchKeys, UserColumns]);

  return (
    <div className="flex flex-col min-h-screen p-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="flex flex-wrap items-center align-middle gap-4 py-4">
        <SearchInput value={search} onChange={setSearch} />
        {tab ? (
          <FilterSelect
            filters={["all", ...Object.values(Role)]}
            value={tab}
            onChange={setTab}
          />
        ) : null}
      </div>
      <SimpleTable columns={UserColumns} data={searched} paginated={true} />
    </div>
  );
}

export default UsersPage;
