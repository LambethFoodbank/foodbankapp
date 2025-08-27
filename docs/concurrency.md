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