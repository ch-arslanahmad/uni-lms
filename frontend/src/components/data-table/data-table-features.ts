// Which TanStack features are ON, anything not registered doesn't exist (TS2339).

import {
  columnFilteringFeature, // enables filtering state + APIs
  createFilteredRowModel, // client-side row model that applies filters
  createSortedRowModel, // client-side row model that applies sorting
  filterFn_includesString, // substring-match filter algorithm
  rowSortingFeature, // enables sorting state + APIs (not the header UI)
  sortFn_text, // sorts text only — pick this OR sortFn_alphanumeric
  tableFeatures, // bundler for features, row models or processing algorithms into a type
} from "@tanstack/react-table";

// Feature registration — search + sort only (no pagination)
export const features = tableFeatures({
  // Behavior: how the table reacts
  columnFilteringFeature,
  rowSortingFeature,

  // HOW the table behaves
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),

  // how to filter/sort (algos)
  filterFns: { includesString: filterFn_includesString }, // "cs" matches "Computer Science"
  sortFns: { text: sortFn_text },
});

export type DataTableFeatures = typeof features;
