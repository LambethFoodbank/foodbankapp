import { TableHeaders } from "@/components/Tables/Table";
import { UserRow } from "./types";

export const usersTableHeaderKeysAndLabels: TableHeaders<UserRow> = [
    ["userId", "User ID"],
    ["firstName", "First Name"],
    ["lastName", "Last Name"],
    ["email", "Email"],
    ["userRole", "Role"],
    ["telephoneNumber", "Phone Number"],
    ["createdAt", "Created At"],
    ["updatedAt", "Updated At"],
    ["lastSignInAt", "Last Sign In"],
];

export const usersTableDefaultShownHeaders: (keyof UserRow)[] = [
    "firstName",
    "lastName",
    "email",
    "userRole",
    "telephoneNumber",
    "lastSignInAt",
];

export const usersTableToggleableHeaders: (keyof UserRow)[] = [
    "userId",
    "createdAt",
    "lastSignInAt",
    "updatedAt",
];
