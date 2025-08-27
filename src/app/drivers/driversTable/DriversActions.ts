import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import {
    DriverRowWithOriginalLastUpdated,
    DriversRow,
} from "@/app/drivers/driversTable/DriversTable";
import { logErrorReturnLogId, logWarningReturnLogId } from "@/logger/logger";
import { PostgrestError } from "@supabase/supabase-js";
import { Tables } from "@/databaseTypesFile";

type DbDriver = Tables<"drivers">;
type NewDbDriver = Omit<DbDriver, "id">;

export const fetchDrivers = async (): Promise<DriversRow[]> => {
    const { data, error } = await supabase.from("drivers").select();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Delivery areas", error);
        throw new DatabaseError("fetch", "drivers", logId);
    }

    return data.map(
        (row): DriversRow => ({
            id: row.id,
            circuitID: row.circuit_id,
            name: row.name,
            isNew: false,
            lastUpdated: row.last_updated,
        })
    );
};

const formatExistingRowToDBDriver = (row: DriversRow): DbDriver => {
    return {
        id: row.id,
        name: row.name,
        circuit_id: row.circuitID,
        last_updated: row.lastUpdated,
    };
};

const formatNewRowToDBDriver = (newRow: DriversRow): NewDbDriver => {
    return {
        name: newRow.name,
        circuit_id: newRow.circuitID,
        last_updated: newRow.lastUpdated,
    };
};

type InsertDriversResult =
    | {
          data: { driversId: string };
          error: null;
      }
    | {
          data: null;
          error: {
              dbError: PostgrestError;
              logId: string;
          };
      };

export const insertNewDrivers = async (newRow: DriversRow): Promise<InsertDriversResult> => {
    const data = formatNewRowToDBDriver(newRow);
    const { data: driver, error } = await supabase.from("drivers").insert(data).select().single();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to add a delivery area", {
            error,
            newDriversData: data,
        });
        return { data: null, error: { dbError: error, logId } };
    }

    return { data: { driversId: driver.id }, error: null };
};

type UpdateDriversResult = {
    error: {
        type: "UpdateDriversFailed" | "ConcurrentEditDrivers" | "DeleteDriversFailed";
        logId: string;
        dbError?: PostgrestError;
    } | null;
};

export const updateDbDrivers = async (
    rowWithOriginalLastUpdated: DriverRowWithOriginalLastUpdated
): Promise<UpdateDriversResult> => {
    const processedData = formatExistingRowToDBDriver(rowWithOriginalLastUpdated);
    const lastUpdated = rowWithOriginalLastUpdated.originalLastUpdated;

    const { error: updateError, count } = await supabase
        .from("drivers")
        .update(
            {
                name: processedData.name,
                circuit_id: processedData.circuit_id,
            },
            { count: "exact" }
        )
        .eq("id", processedData.id)
        .eq("last_updated", lastUpdated);

    if (updateError) {
        const logId = await logErrorReturnLogId("Failed to update driver", {
            updateError,
            newDriverData: processedData,
        });

        return { error: { type: "UpdateDriversFailed", logId } };
    }
    if (count === 0) {
        const logId = await logWarningReturnLogId("Concurrent editing of drivers");
        return { error: { type: "ConcurrentEditDrivers", logId } };
    }

    return { error: null };
};

export const deleteDbDrivers = async (row: DriversRow): Promise<UpdateDriversResult> => {
    const { error: auditUpdateError } = await supabase
        .from("audit_log")
        .update({ driver_id: null })
        .eq("driver_id", row.id);

    if (auditUpdateError) {
        const logId = await logErrorReturnLogId(
            "Failed to clear audit_log references before delete",
            {
                error: auditUpdateError,
                rowData: row,
            }
        );
        return { error: { type: "DeleteDriversFailed", dbError: auditUpdateError, logId } };
    }

    const { data, error } = await supabase.from("drivers").delete().eq("id", row.id).select();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to delete delivery area", {
            error,
            rowData: row,
        });
        return { error: { type: "DeleteDriversFailed", logId, dbError: error } };
    }

    if (!data || data.length === 0) {
        const logId = await logErrorReturnLogId("Delete did not match any records", {
            attemptedId: row.id,
        });
        return {
            error: {
                type: "DeleteDriversFailed",
                logId,
                dbError: {
                    message: "No rows deleted",
                    details: "ID did not match any rows",
                } as unknown as PostgrestError,
            },
        };
    }

    return { error: null };
};
