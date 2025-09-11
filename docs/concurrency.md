# How to Handle Concurrency Issues

Concurrency arises when multiple users try to update the same record at the same time. To prevent overwriting changes and to keep data consistent across the app, we follow a few common patterns.

## General Principles

1. **`last_updated` Field**
   
   Every table that supports editing should include a `last_updated` column of type `timestamp with time zone` (`timestamptz`) with default `CURRENT_TIMESTAMP`.

3. **Automatic Timestamp Updates**
   
   Use a database trigger to refresh `last_updated` on each modification.

5. **Conflict Handling & Messaging**
   
   If an update fails because the `last_updated` no longer matches, we show the user a consistent warning:
   *Record has been edited recently – please refresh the page.*
   
---

## Case: Inline Edits (Notes)

* Example: Editing **client notes** in `ExpandedClientDetails`.
* When a row is opened for editing, store its `last_updated` as `originalLastUpdated`.
* On save, send both the new data and the `originalLastUpdated` to the database.
* The update query includes `WHERE last_updated = originalLastUpdated`.

  * If no rows are updated → concurrency conflict.
* UI response:

  * Reset notes to `originalNotes`.
  * Show concurrency error message.
  * Reload data from DB to keep state in sync.

---

## Case: Admin Panel Updates

* Before running a bulk action, re-fetch the selected rows.
* For each row, check whether `last_updated` has changed since selection.
* If **any** selected row is outdated, abort the whole action.

  * *Avoids partial updates that leave the system in an inconsistent state.*
* Show the same standardized concurrency warning.
* Refs in Admin Tables:
   * When inserting or editing rows that include refs (like `time_slots` for `collection_centres`), store the original `last_updated` of the parent row in memory (`originalTimestampsRef`) and include it on update.

   * On conflict, show the standard concurrency message and reset state by re-fetching both the parent and its ref rows when we exit edit mode, or on reload.

---

## Case: Parcel Updates (State Transitions)

* Example: Updating **packing date** or **packing slot**.
* Uses explicit `supabase.from(...).eq("last_updated", parcel.lastUpdated)` check.
* If `count === 0` → no row matched → concurrency conflict.
* Conflict response:

  * Show standard concurrency warning.
* If DB update succeeds or is canceled → fetch latest record to refresh state.

---

## Error Display & Clearing Strategy

* Errors are shown as floating toasts.
* They clear automatically when:

  * The user cancels, exiting edit mode.
  * The user reloads the page.
  * The user successfully submits another row (for tables).
