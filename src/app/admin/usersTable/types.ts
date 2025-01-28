import { ServerSideFilter, ServerSideFilterMethod } from "@/components/Tables/Filters";
import { SortState } from "@/components/Tables/Table";
import { ServerSideSortMethod } from "@/components/Tables/sortMethods";
import { Schema, UserRole } from "@/databaseUtils";

export type UsersFilterMethod<State> = ServerSideFilterMethod<Schema["profiles"], State>;
export type UsersFilter<State> = ServerSideFilter<UserRow, State, Schema["profiles"]>;
export type UsersFilterAllStates = UsersFilter<string> | UsersFilter<string[]>;
export type UsersFilters = UsersFilterAllStates[];
export type UsersSortMethod = ServerSideSortMethod<Schema["profiles"]>;
export type UsersSortState = SortState<UserRow, UsersSortMethod>;

export type GetUserDataAndCountErrorType =
    | "abortedFetchingProfilesTable"
    | "abortedFetchingProfilesTableCount"
    | "failedToFetchProfilesTable"
    | "failedToFetchProfilesTableCount";

export type GetUsersReturnType =
    | {
          data: {
              userData: UserRow[];
              count: number;
          };
          error: null;
      }
    | {
          data: null;
          error: { type: GetUserDataAndCountErrorType; logId: string };
      };

export type GetUserCountReturnType =
    | {
          data: number;
          error: null;
      }
    | {
          data: null;
          error: { type: GetUserDataAndCountErrorType; logId: string };
      };

export interface UserRow {
    userId: string;
    profileId: string;
    firstName: string;
    lastName: string;
    userRole: UserRole;
    email: string;
    telephoneNumber: string;
    createdAt: number | null;
    updatedAt: number | null;
    lastSignInAt: number | null;
}
