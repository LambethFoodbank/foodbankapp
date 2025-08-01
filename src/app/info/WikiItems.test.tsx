import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import StyleManager from "@/app/themes";
import WikiItems from "@/app/info/WikiItems";
import { DbWikiRow, UserRole } from "@/databaseUtils";
import { expect, it } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { RoleUpdateContext } from "@/app/roles";
import userEvent from "@testing-library/user-event";

const adminManagerAndStaffRoles: { [role: string]: UserRole }[] = [
    { role: "admin" },
    { role: "manager" },
    { role: "staff" },
];
const otherRoles: { [role: string]: UserRole }[] = [{ role: "volunteer" }];

const logID = "a2adb0ba-873e-506b-abd1-8cd1782923c8";

jest.mock("@/logger/logger", () => ({
    logErrorReturnLogId: jest.fn(() => Promise.resolve(logID)),
}));

jest.mock("@/server/auditLog", () => ({
    sendAuditLog: jest.fn(),
}));

jest.mock("@/app/info/supabaseHelpers", () => ({
    reorderTwoItemsInWikiTable: jest.fn(),
    deleteItemInWikiTable: jest.fn(),
    updateItemInWikiTable: jest.fn(),
    createItemInWikiTable: jest.fn(() => ({
        data: {
            content: "",
            row_order: 4,
            title: "",
            wiki_key: "9bc00a7c-e552-40e5-889b-e6ae2cb184f1",
        },
        error: null,
    })),
}));

const mRandomUUID = jest.fn().mockReturnValue("058049b5-7a7f-4f81-bf56-6dc9654e4a40");
jest.mock("uuid", () => ({
    v4: jest.fn(() => mRandomUUID),
}));

const mScrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mScrollIntoViewMock;

describe("Wiki items component", () => {
    let mockData: DbWikiRow[];
    beforeEach(() => {
        cleanup();
        jest.spyOn(window, "confirm").mockImplementation(() => true);

        mockData = [
            {
                title: "Test 1",
                content: "Test content 1",
                wiki_key: "058049b5-7a7f-4f81-bf56-6dc9654e5a40",
                row_order: 1,
                last_updated: new Date().toISOString(),
            },
            {
                title: "Test 3",
                content: "Test content 3",
                wiki_key: "9bc00a7c-e552-40e5-889b-e6ae2cb184g3",
                row_order: 3,
                last_updated: new Date().toISOString(),
            },
            {
                title: "Test 2",
                content: "Test content 2",
                wiki_key: "731280a7-eb99-4229-aa49-84dbb112641c",
                row_order: 2,
                last_updated: new Date().toISOString(),
            },
        ];
    });

    it.each(adminManagerAndStaffRoles)(
        "renders the add, edit, reorder buttons for admins, managers and staff in display mode",
        ({ role }) => {
            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            expect(
                screen.getByRole("button", {
                    name: "+ Add",
                })
            ).toBeVisible();
            expect(screen.getByTestId("#edit-1")).toBeVisible();
            expect(screen.getByTestId("#swap-up-1")).toBeVisible();
            expect(screen.getByTestId("#swap-down-2")).toBeVisible();
            expect(screen.getByTestId("#swap-down-3")).toBeVisible();
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "has edit button for admin, manager and staff users, and on click, has update, cancel, and delete buttons",
        ({ role }) => {
            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            fireEvent.click(screen.getByTestId("#edit-1"));
            expect(screen.getByTestId("#cancel-1")).toBeVisible();
            expect(screen.getByTestId("#update-1")).toBeVisible();
            expect(screen.getByTestId("#delete-1")).toBeVisible();
            expect(screen.getByTestId("#swap-up-1")).toBeVisible();
            expect(screen.getByTestId("#swap-down-1")).toBeVisible();
        }
    );

    it.each(otherRoles)(
        "does not render the add, reorder, or edit buttons for volunteers",
        ({ role }) => {
            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            expect(
                screen.queryByRole("button", {
                    name: "+ Add",
                })
            ).not.toBeInTheDocument();
            expect(screen.queryByTestId("#swap-up-1")).not.toBeInTheDocument();
            expect(screen.queryByTestId("#swap-down-2")).not.toBeInTheDocument();
            expect(screen.queryByTestId("#edit-1")).not.toBeInTheDocument();
        }
    );

    it("renders the wiki rows", () => {
        render(
            <StyleManager>
                <RoleUpdateContext.Provider value={{ role: "volunteer", setRole: jest.fn() }}>
                    <WikiItems rows={mockData} />
                </RoleUpdateContext.Provider>
            </StyleManager>
        );
        expect(screen.getByText("Test 1")).toBeVisible();
        expect(screen.getByText("Test 2")).toBeVisible();
        expect(screen.getByText("Test 3")).toBeVisible();
    });

    it.each(adminManagerAndStaffRoles)(
        "reorders the wiki items when reorder buttons are clicked in display mode for admins, managers and staff",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#swap-up-2"));
            expect(mockData[0].row_order).toBe(2);
            expect(mockData[2].row_order).toBe(1);
            expect(mockData[1].row_order).toBe(3);
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "reorders the wiki items when reorder buttons are clicked in edit mode for admins, managers and staff",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#edit-2"));
            await user.click(screen.getByTestId("#swap-up-2"));
            expect(mockData[0].row_order).toBe(2);
            expect(mockData[2].row_order).toBe(1);
            expect(mockData[1].row_order).toBe(3);
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "deletes a wiki item when its delete button is clicked by an admin, manager and staff member",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#edit-1"));
            await user.click(screen.getByTestId("#delete-1"));
            expect(screen.queryByText("Test 1")).not.toBeInTheDocument();
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "edits a wiki item when its edit button is clicked by an admin, manager and staff member",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#edit-1"));
            const titleInput = screen.getByTestId("#title-1");
            fireEvent.change(titleInput, { target: { value: "Updated Test 1" } });
            const contentInput = screen.getByTestId("#content-1");
            fireEvent.change(contentInput, { target: { value: "Updated Test content 1" } });
            await user.click(screen.getByTestId("#update-1"));
            expect(screen.queryByText("Test 1")).not.toBeInTheDocument();
            expect(screen.getByText("Updated Test 1")).toBeInTheDocument();
            expect(screen.queryByText("Test content 1")).not.toBeInTheDocument();
            expect(screen.getByText("Updated Test content 1")).toBeInTheDocument();
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "adds an item with contents by an admin or a manager",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#add"));
            const titleInput = screen.getByTestId("#title-4");
            fireEvent.change(titleInput, { target: { value: "Added test title" } });
            const contentInput = screen.getByTestId("#content-4");
            fireEvent.change(contentInput, { target: { value: "Added test content" } });
            await user.click(screen.getByTestId("#update-4"));
            expect(screen.getByText("Added test title")).toBeInTheDocument();
            expect(screen.getByText("Added test content")).toBeInTheDocument();
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "cancels an edit when the cancel button is clicked by an admin, manager and staff member",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#edit-1"));
            const titleInput = screen.getByTestId("#title-1");
            fireEvent.change(titleInput, { target: { value: "Updated Test 1" } });
            const contentInput = screen.getByTestId("#content-1");
            fireEvent.change(contentInput, { target: { value: "Updated Test content 1" } });
            await user.click(screen.getByTestId("#cancel-1"));
            expect(screen.queryByText("Updated Test 1")).not.toBeInTheDocument();
            expect(screen.getByText("Test 1")).toBeInTheDocument();
            expect(screen.queryByText("Updated Test content 1")).not.toBeInTheDocument();
            expect(screen.getByText("Test content 1")).toBeInTheDocument();
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "deletes an empty item when it is saved by an admin, manager and staff member",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#add"));
            expect(screen.getByTestId("#swap-up-4")).toBeVisible();
            await user.click(screen.getByTestId("#update-4"));
            expect(screen.queryByTestId("#swap-up-4")).not.toBeInTheDocument();
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "deletes an empty item when it is canceled by an admin, manager and staff member",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#add"));
            expect(screen.getByTestId("#swap-up-4")).toBeVisible();
            await user.click(screen.getByTestId("#cancel-4"));
            expect(screen.queryByTestId("#swap-up-4")).not.toBeInTheDocument();
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "only adds one item when add is clicked, and does not add a second new item if one is already present for admins, managers and staff",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#add"));
            expect(screen.getAllByTestId("#swap-up-4").length).toBe(1);
            await user.click(screen.getByTestId("#add"));
            expect(screen.getAllByTestId("#swap-up-4").length).toBe(1);
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "does not allow the user to reorder the first item up or the last item down for admins, managers and staff",
        async ({ role }) => {
            const user = userEvent.setup();

            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#swap-up-1"));
            expect(mockData[0].row_order).toBe(1);
            expect(mockData[1].row_order).toBe(3);
            expect(mockData[2].row_order).toBe(2);
            await user.click(screen.getByTestId("#swap-down-3"));
            expect(mockData[0].row_order).toBe(1);
            expect(mockData[1].row_order).toBe(3);
            expect(mockData[2].row_order).toBe(2);
        }
    );

    it.each(adminManagerAndStaffRoles)(
        "does not delete an item if the user does not confirm the deletion for admins, managers and staff",
        async ({ role }) => {
            const user = userEvent.setup();
            jest.spyOn(window, "confirm").mockImplementation(() => false);
            render(
                <StyleManager>
                    <RoleUpdateContext.Provider value={{ role: role, setRole: jest.fn() }}>
                        <WikiItems rows={mockData} />
                    </RoleUpdateContext.Provider>
                </StyleManager>
            );
            await user.click(screen.getByTestId("#edit-1"));
            await user.click(screen.getByTestId("#delete-1"));
            expect(screen.getByTestId("#title-1")).toBeInTheDocument();
        }
    );
});
