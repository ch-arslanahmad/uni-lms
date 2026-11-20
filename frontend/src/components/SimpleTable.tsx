// Generic table: search + sort + pagination with 4 useStates total.
// State lives HERE, ui/table.tsx only does markup, no logic.

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { SearchInput } from "./SearchInput";

// What one column is: its field key, its header, whether it can sort,
export interface Column<T> {
  key: keyof T & string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export function SimpleTable<T>({
  columns,
  data,
  searchKeys,
  searchPlaceholder = "Search...",
  searchable = true,
  paginated = false,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
}: {
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T & string)[]; // which things for the search to include, default: 
  searchPlaceholder?: string;
  searchable?: boolean; // false = hide the search box entirely
  paginated?: boolean; // opt-in: pass paginated to show footer + page slicing
  pageSizeOptions?: number[];
  initialPageSize?: number;
}) {

  // The 4 states — one object for sort so only ONE column sorts at a time
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(null);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  // Searching or changing page size sends us back to page 1
  React.useEffect(() => {
    setPage(0);
  }, [search, pageSize]);



  // FILTER, search matches the given fields
  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    const keys = searchKeys ?? columns.map((column) => column.key);
    return data.filter((row) =>
      keys.some((key) =>
        String(row[key] ?? "").toLowerCase().includes(query),
      ),
    );
  }, [data, search, searchKeys, columns]);

  // 2) SORT
  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => { // creates a copy to avoid mutation of the original array
      const av = a[sort.key as keyof T]; // fetch the values for the sort key from both objects
      const bv = b[sort.key as keyof T];
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sort]);

  // 3) PAGINATE, clamp the page so filtering can
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize)); // at least 1 page even if no results
  const safePage = Math.min(page, pageCount - 1); // clamp the page so filtering can reduce the number of pages
  const rows = paginated
    ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize)
    : sorted; // if not paginated, show all rows

  // Click: none → asc → desc → none
  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key !== key) // if not sorted by this key, then asc, 
        return { key, dir: "asc" };
      return prev.dir === "asc" ? { key, dir: "desc" } : null; // if sorted by this key, then toggle asc/desc/none
    });

  }

  return (
    <div className="space-y-3">
      {/* search — hidden when searchable={false} */}
      {searchable && (
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={searchPlaceholder}
        />
      )}

      {/* the table itself */}
      <div className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>

                  <Button variant="ghost" onClick={() => toggleSort(column.key)}>
                    {column.label}
                    {sort?.key === column.key ? (
                      sort.dir === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                  )
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
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

      {/* pagination footer */}
      {paginated && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page</span>
            <select
              className="h-8 rounded-md border bg-background px-2"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground">
              {sorted.length
                ? `${safePage * pageSize + 1}–${safePage * pageSize + rows.length} of ${sorted.length}`
                : "0 of 0"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(0)}
              disabled={safePage === 0}
              aria-label="First page"
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={safePage === 0}
              aria-label="Previous page"
            >
              ‹
            </Button>
            <span className="text-muted-foreground">
              Page {safePage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              disabled={safePage >= pageCount - 1}
              aria-label="Next page"
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pageCount - 1)}
              disabled={safePage >= pageCount - 1}
              aria-label="Last page"
            >
              »
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
