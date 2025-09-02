import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { SortState } from "@/components/Tables/Table";
import { DbAuditLogRow } from "@/databaseUtils";
import { AuditLogRow, AuditLogSortMethod } from "../types";

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
export type AuditLogSortState = SortState<AuditLogRow, AuditLogSortMethod>;
