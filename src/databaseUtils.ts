import { Database } from "@/databaseTypesFile";

export type DatabaseAutoType = Database;

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];

export type Schema = {
    [key in keyof Tables]: Tables[key]["Row"];
};

export type InsertSchema = {
    [key in keyof Tables]: Tables[key]["Insert"];
};

export type UpdateSchema = {
    [key in keyof Tables]: Tables[key]["Update"];
};

export type DatabaseEnums = Database["public"]["Enums"];
export type UserRole = DatabaseEnums["role"];

export type ViewSchema = {
    [key in keyof Views]: Views[key]["Row"];
};

export type TableNames = keyof Tables;

export type ViewNames = keyof Views;

export type ParcelStatus = Schema["status_order"]["event_name"];

export type DbAuditLogRow = ViewSchema["audit_log_plus"];
export type DbClientRow = ViewSchema["clients_plus"];
export type DbParcelRow = ViewSchema["parcels_plus"];
export type DbReportRow = ViewSchema["reports"];
export type DbWikiRow = Schema["wiki"];
