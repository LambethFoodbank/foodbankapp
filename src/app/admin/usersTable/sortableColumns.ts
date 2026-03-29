import { SortOptions } from "@/components/Tables/materialTable/tableTypes";
import { UserRow, UsersSortMethod } from "./types";

export const usersSortableColumns: SortOptions<UserRow, UsersSortMethod>[] = [
    {
        key: "firstName",
        sortMethod: (sortDirection, query) =>
            query.order("first_name", { ascending: sortDirection === "asc" }),
    },
    {
        key: "lastName",
        sortMethod: (sortDirection, query) =>
            query.order("last_name", { ascending: sortDirection === "asc" }),
    },
    {
        key: "userRole",
        sortMethod: (sortDirection, query) =>
            query.order("role", { ascending: sortDirection === "asc" }),
    },
    {
        key: "email",
        sortMethod: (sortDirection, query) =>
            query.order("email", { ascending: sortDirection === "asc" }),
    },
    {
        key: "telephoneNumber",
        sortMethod: (sortDirection, query) =>
            query.order("telephone_number", { ascending: sortDirection === "asc" }),
    },
    {
        key: "createdAt",
        sortMethod: (sortDirection, query) =>
            query.order("created_at", { ascending: sortDirection === "asc" }),
    },
    {
        key: "updatedAt",
        sortMethod: (sortDirection, query) =>
            query.order("updated_at", { ascending: sortDirection === "asc" }),
    },
    {
        key: "lastSignInAt",
        sortMethod: (sortDirection, query) =>
            query.order("last_sign_in_at", { ascending: sortDirection === "asc" }),
    },
];
