import { UserRole } from "@/databaseUtils";

export const pathsNotRequiringLogin = [
    "/login",
    "/forgot-password",
    "/auth/reset-password",
    "/set-password",
] as const;

const pathsShownToAllAuthenticatedUsers = [
    "/clients",
    "/info",
    "/parcels",
    "/set-password",
    "/update-password",
] as const;

const pathsOnlyShownToStaffAndAbove = ["/lists", "/reports"] as const;

const pathsOnlyShownToAdmin = ["/admin"] as const;

const getShownPagesByRole = (role: UserRole | null): readonly string[] => {
    if (role) {
        if (adminRoles.includes(role)) {
            return [
                ...pathsShownToAllAuthenticatedUsers,
                ...pathsOnlyShownToStaffAndAbove,
                ...pathsOnlyShownToAdmin,
            ];
        }
        if (organisationRoles.includes(role)) {
            return [...pathsShownToAllAuthenticatedUsers, ...pathsOnlyShownToStaffAndAbove];
        }
        if (allRoles.includes(role)) {
            return pathsShownToAllAuthenticatedUsers;
        }
    }
    return pathsNotRequiringLogin;
};

export const roleCanAccessPage = (role: UserRole | null, url: string): boolean => {
    const accessList = getShownPagesByRole(role);
    return accessList.some((page) => url.startsWith(page));
};

export const roleCanAccessOutsideDeliveryAreaModal = (
    role: UserRole | null,
    isDeliverable: boolean | null
): boolean => {
    return isDeliverable || (role !== null && organisationRoles.includes(role));
};

export const allRoles: UserRole[] = ["volunteer", "staff", "manager", "admin"];
export const organisationRoles: UserRole[] = ["staff", "manager", "admin"];
export const managerOrAboveRoles: UserRole[] = ["manager", "admin"];
export const adminRoles: UserRole[] = ["admin"];
