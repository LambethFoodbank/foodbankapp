import supabase from "@/supabaseClient";
import { WebsiteDataRow } from "./WebsiteDataTable";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import { AuditLog, sendAuditLog } from "@/server/auditLog";
import { getReadableWebsiteDataName } from "@/common/format";

type DbWebsiteData = Tables<"website_data">;
type FetchWebsiteDataErrors = "failedToFetchWebsiteData";
type FetchWebsiteDataErrorReturn =
    | {
          data: null;
          error: { type: FetchWebsiteDataErrors; logId: string };
      }
    | {
          data: WebsiteDataRow[];
          error: null;
      };
type UpdateWebsiteDataErrors = "failedToUpdateWebsiteData" | "concurrentEditWebsiteData";
type UpdateWebsiteDataErrorReturn =
    | {
          error: { type: UpdateWebsiteDataErrors; logId: string | null };
      }
    | { error: null };

export const fetchWebsiteData = async (): Promise<FetchWebsiteDataErrorReturn> => {
    const { data, error } = await supabase.from("website_data").select().order("name");

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: website data", error);
        return { error: { type: "failedToFetchWebsiteData", logId }, data: null };
    }

    const websiteData = data.map(
        (row): WebsiteDataRow => ({
            dbName: row.name,
            readableName: getReadableWebsiteDataName(row.name),
            value: row.value,
            id: row.name,
            lastUpdated: row.last_updated,
        })
    );

    return { data: websiteData, error: null };
};

export const updateDbWebsiteData = async (
    newRow: WebsiteDataRow,
    originalTimestamp: string | undefined
): Promise<UpdateWebsiteDataErrorReturn> => {
    const processedData: DbWebsiteData = {
        name: newRow.dbName,
        value: newRow.value,
        last_updated: newRow.lastUpdated,
    };

    const {
        data: updatedWebsiteData,
        error,
        count,
    } = await supabase
        .from("website_data")
        .update({ value: processedData.value }, { count: "exact" })
        .eq("name", processedData.name)
        .eq("last_updated", originalTimestamp)
        .select();

    const auditLog = {
        action: "update website data",
        content: processedData,
        websiteData: processedData.name,
    } as const satisfies Partial<AuditLog>;

    if (error) {
        const logId = await logErrorReturnLogId("Error with update: website data", error);
        void sendAuditLog({ ...auditLog, wasSuccess: false, logId });
        return { error: { type: "failedToUpdateWebsiteData", logId } };
    }

    if (count === 0) {
        return { error: { type: "concurrentEditWebsiteData", logId: null } };
    }

    void sendAuditLog({ ...auditLog, wasSuccess: true, content: updatedWebsiteData });
    return { error: null };
};
