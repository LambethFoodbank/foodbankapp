# Guide to Table Components

Main elements that need to be addressed:

- [x] Header, Column, and Row Formatting
- [x] Data and generic types
- [x] Action buttons
- [x] Sorting methods
- [x] Pagination
- [x] Filtering options
- [x] Conditional styling
- [x] Row reordering / drag and drop
- [ ] Working with column-specific options

### Material Table Workflow & Components

```typescript jsx
interface MRTTableProps<
  Data extends MRT_RowData,
  DbData extends Record<string, unknown>,
  PaginationType,
> {
  ...
}
```

- `useMaterialReactTable()` - main hook for table state and logic
- `<MaterialReactTable table={table} />` - main table component

### Header, Column, and Row Formatting

### Show/Hide Menu and Toggleable Headers

Hiding and showing columns can be done via the `onColumnVisibilityChange` option in the `useMaterialReactTable` hook.
This requires maintaining the `columnVisibility` state in our component, and passing it to the `state` table prop,
alongside its setter function as follows:

```typescript jsx
const table = useMaterialReactTable({
  state: {
    columnVisibility,
  },
  onColumnVisibilityChange: setColumnVisibility,
};
```

To disable columns from the Show/Hide menu, we use the toggleableHeaders prop on the `<MaterialTable />` component,
paired with the column-specific `visibleInShowHideMenu` option.
This is done inside the same method that maps original headers to MRT columns (`mapHeadersToMRTColumns()`).

There is a noteworthy distinction between the different header props that are passed to the `<MaterialTable />`
component:

- `headerKeysAndLabels` - all headers that are passed to the table, including those that are hidden
- `toggleableHeaders` - headers that can be toggled in the Show/Hide menu
- `defaultShownHeaders` - headers that are shown by default (some of which **may not** be available in the Show/Hide
  menu)

### Server/Client Pagination

The pagination type is responsible for multiple behaviors in the table, including:

- Rows per page options
- **Sorting** behavior
- **Filtering** behavior (out of our scope because of the already-implemented `<TableFiltersBar />` component)

MRT's default pagination type is **client-side**, but it can be configured for **server-side** pagination by setting the
`manualPagination` option to `true` in the `useMaterialReactTable` hook.
This implies that the table should receive a `paginationConfig` prop, whose type is defined as follows:

```typescript
export type PaginationConfig =
  | {
  enablePagination: true; // = server-side pagination
  filteredCount: number; // --> total number of rows after filtering (if any filters applied)
  onPageChange: (newPage: number) => void; // --> function to call when page changes (change the currentPage state)
  onPerPageChange: (perPage: number) => void; // --> function to call when the number of rows per page changes
  rowsPerPageOptions?: number[]; // --> options for rows per page selection in the bottom toolbar
  defaultRowsPerPage?: number; // --> default number of rows per page
}
  | {
  enablePagination: false; // = client-side pagination (default)
};
```

The `paginationConfig` options are specified in the parent component (e.g. the `<ParcelTable />` component) and may
differ from one table to another.

To customize the pagination, we use a corresponding state variable, initialized with default values from the config
object:

```typescript
const [pagination, setPagination] = useState<MRT_PaginationState>({
  pageIndex: 0,
  pageSize: paginationConfig.enablePagination
    ? paginationConfig.defaultRowsPerPage ?? 10
    : 10,
});
```

Passing the `setPagination` function to the `onPaginationChange` option in the `useMaterialReactTable` hook is
insufficient on its own, because the parents' `onPageChange` and `onPerPageChange` events need to be handled separately.
Therefore, an additional useEffect is used to call these functions when the corresponding state variables change:

```typescript
useEffect(() => {
  if (paginationConfig?.enablePagination) {
    paginationConfig.onPageChange?.(pagination.pageIndex);
    paginationConfig.onPerPageChange?.(pagination.pageSize);
  }
}, [pagination.pageIndex, pagination.pageSize]);
```

_Note: Indexing starts at 0, with the start and endpoints of each page being calculated as follows:_

```typescript
const startPoint = currentPage * perPage;
const endPoint = startPoint + perPage - 1;
```

### Manual Sorting

Column sorting can be configured to be either manual (server-side) or automatic (client-side).

The table receives a `sortingConfig` prop, based on which the sorting behavior is determined.

```typescript
export type SortConfig<Data, SortMethod extends GenericSortMethod> =
  | {
  sortPossible: true; // = manual sorting
  sortableColumns: SortOptions<Data, SortMethod>[]; // --> columns that can be sorted, alongside their sort methods
  setSortState: (sortState: SortState<Data, SortMethod>) => void;
  // --> function to call when sort state changes (this is used by the parent component to update its fetch query)
}
  | { sortPossible: false };
```

Similarly to how pagination is handled, the parent component (e.g. `<ParcelTable />`) is responsible for maintaining the
`sortState` variable - our job is to call the higher-level `setSortState` function whenever the MRT `sorting` state
changes.

However, the `sorting` and `sortState` types are different, mainly because of how columns are treated in MRT.

On the one hand, the MRT `sorting` state is an array of objects, each containing the column `id` (which corresponds to
the `accessorKey` of the column) and a `desc` boolean indicating whether the sorting is descending or not.

On the other hand, the `sortState` type contains a reference to the actual column object (from the `sortableColumns`
array) and a sort method that is used to build the Supabase query (see the following types for reference: `SortOptions`,
`SortOrder`, and `SortState`).

This implies that we need to transform the information stored in the MRT `sorting` state, so that it becomes compatible
with the `sortState` type:

```typescript
useEffect(() => {
...
  // Get the first sorting item (we only support single-column sorting at the moment)
  const sortingItem = sorting[0];
  if (!sortingItem?.id) {
    return;
  }

  // Find the corresponding column in the sortableColumns array (although types differ, their keys should match)
  const column = sortConfig.sortableColumns.find(
    (col) => col.key.toString() === sortingItem.id
  );
  if (!column) {
    return;
  }

  // Determine the MRT sort direction
  const sortDirection = sortingItem.desc ? "desc" : "asc";

  // Call the higher-level setSortState function with the transformed sort state
  sortConfig.setSortState({
    sortEnabled: true,
    column: column,
    sortDirection: sortDirection as SortOrder,
  });
}, [sorting]);  // although recommended, we don't include sortConfig in the dependency array to avoid an infinite render loop
```

### Row selection & Checkboxes

There are two different types of row selection that are considered:

- Individual on-click events (mutually exclusive; sometimes results in a separate details panel being shown)
- Multiple row selection (checkboxes; can be used for actions/report generation)

**1. Individual on-click events**

This is done by passing an `onRowClick` function inside the `muiTableBodyRowProps` MRT hook option.
It's important to note that, besides the event argument, this method requires an **MRT_Row type assertion** for its row
parameter.

```typescript
type OnRowClickFunction<Data extends MRT_RowData> = (
  row: MRT_Row<Data>,
  event: React.MouseEvent<Element, MouseEvent>
) => void;

const table = useMaterialReactTable({
  muiTableBodyRowProps: ({ row }) => ({
    onClick: (event) => {
      onRowClick?.(row as MRT_Row<Parcel>, event);
    },
    sx: {
      cursor: "pointer",
    },
  }),
});
```

**2. Multiple row selection (checkboxes)**

Because of the interferences between the internal and external row selection states, we handle checkbox configuration *
*externally**, inside the parent component (e.g. `<ParcelTable />`).

This implies that the MRT **does not** have an
explicit `rowSelection` state, nor an `onRowSelectionChange` option; therefore, the table itself is **not** aware of the
selected rows, and all conditional styling that involves selected rows is handled externally as well (displaying the
selected row count, highlighting selected rows, etc.).

```typescript
export type CheckboxConfig<Data> =
  | {
  displayed: true;
  selectedRowIds: string[];
  isAllCheckboxChecked: boolean;
  onCheckboxClicked: (row: Data) => void;
  onAllCheckboxClicked: (isAllCheckboxChecked: boolean) => void;
  isRowChecked: (data: Data) => boolean;
}
  | {
  displayed: false;
};
```

The `CheckboxConfig` type contains all the necessary information and functions to handle checkbox behavior. These
methods are called inside the corresponding MRT hook options: `muiSelectCheckboxProps` (for individual row checkboxes)
and `muiSelectAllCheckboxProps` (for the header checkbox).

### Row Reordering / Drag and Drop

Row reordering is activated by setting the `enableRowOrdering` option to `true` in the `useMaterialReactTable` hook.

