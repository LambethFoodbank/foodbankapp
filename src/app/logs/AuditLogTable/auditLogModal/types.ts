import { DbAuditLogRow } from "@/databaseUtils";

export type AuditLogModalRowResponse<Data> =
    | {
          data: Data;
          errorMessage: null;
      }
    | {
          data: null;
          errorMessage: string;
      };
export type ParcelsSortMethod = ServerSideSortMethod<DbAuditLogRow>;
export type AuditLogSortState = SortState<AuditLogTableRow, AuditLogSortMethod>;