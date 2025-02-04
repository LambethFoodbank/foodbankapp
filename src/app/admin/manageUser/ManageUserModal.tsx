import React, { useState } from "react";
import { UserRow } from "../usersTable/types";
import Modal from "@/components/Modal/Modal";
import styled from "styled-components";
import ResetPasswordForm from "@/app/admin/manageUser/ResetPasswordForm";
import EditUserForm from "@/app/admin/manageUser/EditUserForm";
import ManageUserOptions from "@/app/admin/manageUser/ManageUserOptions";
import { AlertOptions, SetAlertOptions } from "@/app/admin/common/SuccessFailureAlert";
import ResendInvitationForm from "./ResendInvitationForm";

const ManageModalContent = styled.div`
    padding: 0 0.5rem;
`;

export const EditOption = styled.div`
    margin-bottom: 1.5rem;
`;

export const EditHeader = styled.h2`
    margin-bottom: 0.5rem;
`;

export const EditSubheading = styled.h3`
    margin-bottom: 0.5rem;
`;

export type ManageMode = "editDetails" | "resetPassword" | "resendInvitation" | "options";

interface Props {
    userToEdit: UserRow | null;
    setUserToEdit: (user: UserRow | null) => void;
    setAlertOptions: SetAlertOptions;
}

const ManageUserModal: React.FC<Props> = (props) => {
    const [manageMode, setManageMode] = useState<ManageMode>("options");

    const onEditConfirm = (alertOptions: AlertOptions): void => {
        props.setAlertOptions(alertOptions);
        props.setUserToEdit(null);
        setManageMode("options");
    };

    const onCancel = (): void => {
        setManageMode("options");
        props.setUserToEdit(null);
    };

    if (props.userToEdit === null) {
        return <></>;
    }

    const modes = {
        editDetails: {
            header: "Edit Details",
            content: (
                <EditUserForm
                    userToEdit={props.userToEdit}
                    onConfirm={onEditConfirm}
                    onCancel={onCancel}
                />
            ),
        },
        resetPassword: {
            header: "Reset Password",
            content: (
                <ResetPasswordForm
                    userToEdit={props.userToEdit}
                    onConfirm={onEditConfirm}
                    onCancel={onCancel}
                />
            ),
        },
        resendInvitation: {
            header: "Resend Invitation",
            content: (
                <ResendInvitationForm
                    userToEdit={props.userToEdit}
                    onConfirm={onEditConfirm}
                    onCancel={onCancel}
                />
            ),
        },
        options: {
            header: "Manage User",
            content: (
                <ManageUserOptions
                    userHasSignedIn={props.userToEdit.lastSignInAt !== null}
                    setManageMode={setManageMode}
                    onCancel={onCancel}
                />
            ),
        },
    };

    return (
        <Modal
            header={`${modes[manageMode].header}`}
            headerId="editUserModal"
            isOpen
            onClose={onCancel}
        >
            <ManageModalContent>
                <EditOption>
                    <EditHeader>User</EditHeader>
                    {props.userToEdit.email}
                </EditOption>
                {modes[manageMode].content}
            </ManageModalContent>
        </Modal>
    );
};

export default ManageUserModal;
