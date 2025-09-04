# Guide to Table Components

### Material Table Components

```typescript jsx
interface MRTTableProps<
  PaginationType,
  FilterState,
  Data extends MRT_RowData,
  DbData extends Record<string, unknown>,
> {
  ...
}
```

- `useMaterialReactTable()` - main hook for table state and logic
- `<MaterialReactTable table={table} />` - main table component

### Header & Column Formatting

MRT headers are defined as a simple list of keys.
By contrast, columns are objects expected to contain at least the following properties:

- an `accessorKey`/`accessorFn` (actual column identifiers)
- a `header` label

Because of the different styling options that we want to apply to our table cells, we use the `mapHeadersToMRTColumns`
method to map the headers received from parent-components to a set of MRT-compatible column objects. This way, we are
able to customize:

- manual sorting methods
- cell rendering (`ColumnDisplayFunctions`)
- column styling (although more options are available in the main MRT hook)

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
});
```

We do not use the default `Show/Hide Menu` in the MRT library, mainly because of its limitations regarding column
groups (e.g. toggling multiple columns through a single handler). To some extent, these drawbacks are specific to the
library version we are currently using (v2.3.0).
Given this situation, we opted for our own `ColumnTogglePopup` component, which interacts with MRT's `visibility` state.

There is a noteworthy distinction between the different header props that are passed to the `<MaterialTable />`
component:

- `headerKeysAndLabels` - all headers that are passed to the table, including those that are hidden
- `toggleableHeaders` - headers that can be toggled in the Show/Hide menu (both individual and belonging to column
  groups)
- `columnGroups` - groups of headers that can be toggled on/off through a single handler (e.g. the `referral details`
  key handles the `referral agency`, `referrer name`, `phone` and `email` fields)
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
not enough on its own, because the parents' `onPageChange` and `onPerPageChange` events need to be handled separately.
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

Column sorting can be configured to be either **manual** (`server-side`) or **automatic** (`client-side`) (through the
`manualSorting` table prop).

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

- Individual _on-click_ events (mutually exclusive; sometimes results in a separate details panel being shown)
- Multiple row selection (checkboxes; can be used for actions/report generation)

**1. Individual on-click events**

This is done by passing an `onRowClick` function inside the `muiTableBodyRowProps` hook option.
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

The `CheckboxConfig` type contains all of the necessary information and functions to handle checkbox behavior. These
methods are called inside the corresponding MRT hook options: `muiSelectCheckboxProps` (for individual row checkboxes)
and `muiSelectAllCheckboxProps` (for the header checkbox).

### Manual Filtering

Filtering is handled externally through our custom `<TableFiltersBar />` component; MRT's own filter properties are
disabled by setting the `enableColumnFilters` option to false.

### Row Reordering / Drag and Drop

Row reordering is activated by setting the `enableRowOrdering` option to `true` in the `useMaterialReactTable` hook. The
external `onRowReorder` method is called inside the `muiRowDragHandleProps` options to customize each table's
behaviour (although currently only the `ListsDataview` implements draggable rows).

### Row Actions

Possible row actions and custom buttons/handlers are specified through the `enableRowActions` and `renderRowActions`
props (these include the edit/remove buttons in the `Lists Dataview`).

### Styling

All (conditional) styling options are passed to the table through specific MUI props. Some basic options are specified
in the `tableStyles.tsx` file.
