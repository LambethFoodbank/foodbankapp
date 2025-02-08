import { Supabase } from "@/supabaseUtils";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { Database } from "@/databaseTypesFile";
import {
    UsersSortState,
    GetUsersReturnType,
    GetUserCountReturnType,
    UserRow,
    UsersFilters,
    UsersFilterAllStates,
} from "./types";
import { DbQuery } from "@/components/Tables/Filters";
import { Schema } from "@/databaseUtils";

export const getUsersDataAndCount = async (
    supabase: Supabase,
    startIndex: number,
    endIndex: number,
    filters: UsersFilters,
    sortState: UsersSortState,
    abortSignal: AbortSignal
): Promise<GetUsersReturnType> => {
    let query = supabase.from("profiles").select("*").not("user_id", "is", null) as DbQuery<
        Schema["profiles"]
    >;

    if (sortState.sortEnabled && sortState.column.sortMethod) {
        query = sortState.column.sortMethod(sortState.sortDirection, query);
    } else {
        query = query.order("first_name");
    }
    query = getQueryWithFiltersApplied(query, filters);

    query.range(startIndex, endIndex);

    query.abortSignal(abortSignal);

    const { data: users, error: userError } = (await query) as {
        data: Schema["profiles"][];
        error: Error | null;
    };

    if (userError) {
        if (abortSignal.aborted) {
            const logId = await logInfoReturnLogId("Aborted fetch: profiles table", {
                error: userError,
            });
            return { error: { type: "abortedFetchingProfilesTable", logId }, data: null };
        }

        const logId = await logErrorReturnLogId("Error with fetch: profiles table", {}, userError);
        return { error: { type: "failedToFetchProfilesTable", logId }, data: null };
    }

    const userData: UserRow[] = users.map((user) => {
        return {
            userId: user.user_id ?? "",
            profileId: user.primary_key ?? "",
            firstName: user.first_name ?? "",
            lastName: user.last_name ?? "",
            userRole: user.role ?? null,
            email: user.email ?? "",
            telephoneNumber: user.telephone_number ?? "-",
            createdAt: user.created_at ? Date.parse(user.created_at) : null,
            updatedAt: user.updated_at ? Date.parse(user.updated_at) : null,
            lastSignInAt: user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : null,
        };
    });

    const { data: userCount, error: userCountError } = await getUsersCount(
        supabase,
        filters,
        abortSignal
    );
    if (userCountError) {
        return { data: null, error: userCountError };
    }

    return { error: null, data: { userData, count: userCount } };
};

const getUsersCount = async (
    supabase: Supabase,
    filters: UsersFilters,
    abortSignal: AbortSignal
): Promise<GetUserCountReturnType> => {
    let query = supabase.from("profiles").select("*", { count: "exact", head: true }) as DbQuery<
        Schema["profiles"]
    >;

    query = getQueryWithFiltersApplied(query, filters);

    query = query.abortSignal(abortSignal);

    const { count, error: userError } = await query;

    if (userError || count === null) {
        if (abortSignal.aborted) {
            const logId = await logInfoReturnLogId("Aborted fetch: profile table count");
            return { error: { type: "abortedFetchingProfilesTableCount", logId }, data: null };
        }

        const logId = await logErrorReturnLogId("Error with fetch: profile table count", {
            error: userError,
        });
        return { error: { type: "failedToFetchProfilesTableCount", logId }, data: null };
    }

    return { error: null, data: count };
};

function getQueryWithFiltersApplied(
    originalQuery: PostgrestFilterBuilder<Database["public"], Record<string, unknown>, unknown>,
    filters: UsersFilters
): PostgrestFilterBuilder<Database["public"], Record<string, unknown>, unknown> {
    let query = originalQuery;

    filters.forEach((filter: UsersFilterAllStates) => {
        // We know that filter.method and filter.state are compatible, but it doesn't work with filter defined
        // through interfaces. Ideally we would rewrite filters to be classes so it's all consistent.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = filter.method(query, filter.state as any);
    });

    return query;
}
