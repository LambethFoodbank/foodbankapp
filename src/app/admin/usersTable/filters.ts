import { serverSideChecklistFilter } from "@/components/Tables/ChecklistFilter";
import { UserRow, UsersFilter, UsersFilterMethod, UsersFilters } from "./types";
import { buildServerSideTextFilter } from "@/components/Tables/TextFilter";
import { allRoles } from "@/app/roles";
import { Schema } from "@/databaseUtils";

const firstNameSearch: UsersFilterMethod<string> = (query, state) => {
    if (state === "") {
        return query;
    } else {
        return query.ilike("first_name", `%${state}%`);
    }
};

const lastNameSearch: UsersFilterMethod<string> = (query, state) => {
    if (state === "") {
        return query;
    } else {
        return query.ilike("last_name", `%${state}%`);
    }
};

const emailSearch: UsersFilterMethod<string> = (query, state) => {
    return query.ilike("email", `%${state}%`);
};

const buildUserRoleFilter = (): UsersFilter<string[]> => {
    const userRoleSearch: UsersFilterMethod<string[]> = (query, state) => {
        return query.in("role", state);
    };

    const userRoleFilter = serverSideChecklistFilter<UserRow, Schema["profiles"]>({
        key: "userRole",
        filterLabel: "User Role",
        itemLabelsAndKeys: allRoles.map((userRole) => [userRole, userRole]),
        initialCheckedKeys: allRoles,
        method: userRoleSearch,
    });

    return userRoleFilter;
};

export const usersFilters: UsersFilters = [
    buildServerSideTextFilter({
        key: "firstName",
        label: "First Name",
        method: firstNameSearch,
    }),
    buildServerSideTextFilter({
        key: "lastName",
        label: "Last Name",
        method: lastNameSearch,
    }),
    buildServerSideTextFilter({
        key: "email",
        label: "Email",
        method: emailSearch,
    }),
    buildUserRoleFilter(),
];
