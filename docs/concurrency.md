# Concurrency Handling

Concurrency is a common concern across the site. While the handling may differ between components, similar patterns can be observed in several scenarios.

## Admin Panel

### 1. Add `last_updated` Field
- Create a migration to add a `last_updated` column to the table.
- Use the type `timestamp with time zone` (`timestamptz`) with a default value of `CURRENT_TIMESTAMP`.

### 2. Automatic Timestamp Update
- Create a migration to add a trigger that automatically updates the `last_updated` field whenever a row is modified.

### 3. Track Original Timestamp
- When opening the edit form, save the current row's timestamp in a variable `originalLastUpdated`.

### 4. Check for Concurrent Edits
- Before saving changes, compare `originalLastUpdated` with the current `last_updated` value from the database.

### 5. Maintain Data Consistency
- If a concurrency conflict is detected, display the following message:
  *Record has been edited recently - please refresh the page. Log ID: ${error.logId}*

## Parcels Page Actions

### 1. Add `last_updated` Field
- Create a migration to add a `last_updated` column to the table.
- Use the type `timestamp with time zone` (`timestamptz`) with a default value of `CURRENT_TIMESTAMP`.

### 2. Automatic Timestamp Update
- Create a migration to add a trigger that automatically updates the `last_updated` field whenever a row is modified.

### 3. Track Concurrent Updates for Selected Parcels
- For action buttons that operate on selected parcels, fetch the latest state of all selected parcels from the database.
- For each parcel, check whether it has been updated since it was last fetched.
- Implement a function that returns true or false depending on whether a parcel was modified in the meantime.

### 4. Check for Any Concurrent Modifications
- Collect all boolean results from the previous check and combine them with *&&*.
- If any of the selected parcels have been modified, do not apply the update to any of them.

### 5. Maintain Data Consistency
- If a concurrency conflict is detected, display the following message:
  *Record has been edited recently - please refresh the page. Log ID: ${error.logId}*

