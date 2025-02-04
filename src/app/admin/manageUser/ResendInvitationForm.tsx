"use client";

import React, { useCallback, useState } from "react";
import { EditOption, EditSubheading } from "@/app/admin/manageUser/ManageUserModal";
import Button from "@mui/material/Button";
import OptionButtonsDiv from "@/app/admin/common/OptionButtonsDiv";
import { UserRow } from "../usersTable/types";
import { AlertOptions } from "@/app/admin/common/SuccessFailureAlert";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import styled, { DefaultTheme } from "styled-components";
import { adminInviteUser } from "@/server/adminInviteUser";
import { InviteUserFields } from "../createUser/CreateUserForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

interface Props {
    userToEdit: UserRow;
    onCancel: () => void;
    onConfirm: (alertOptions: AlertOptions) => void;
}

interface UpdatePasswordResponse {
    errorMessage: string | null;
}

const ErrorMessage = styled.span<{ theme: DefaultTheme }>`
    color: ${(props) => props.theme.error};
`;

const sendInvitation = async (userToInvite: UserRow): Promise<UpdatePasswordResponse> => {
    const invitableUser: InviteUserFields = {
        email: userToInvite.email,
        role: userToInvite.userRole,
        firstName: userToInvite.firstName,
        lastName: userToInvite.lastName,
        telephoneNumber: userToInvite.telephoneNumber,
    };

    const redirectUrl = `${window.location.origin}/set-password`;

    const response = await adminInviteUser(invitableUser, redirectUrl);

    if (response.error) {
        void logErrorReturnLogId(`Error inviting userId: ${userToInvite.userId}`, {
            response,
        });
        return { errorMessage: "Failed to send invitation." };
    }
    return { errorMessage: null };
};

const ResendInvitationForm: React.FC<Props> = ({ userToEdit, onCancel, onConfirm }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onOk = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>): void => {
            event.preventDefault();

            sendInvitation(userToEdit).then(({ errorMessage }) => {
                setErrorMessage(errorMessage);
                if (!errorMessage) {
                    onConfirm({
                        success: true,
                        message: (
                            <>
                                Invitation successfully resent to <b>{userToEdit.email}</b>.
                            </>
                        ),
                    });
                    void logInfoReturnLogId(
                        `Invitation successfully resent to ${userToEdit.email}`
                    );
                }
            });
        },
        [onConfirm, userToEdit]
    );

    return (
        <form>
            <EditOption>
                <EditSubheading>
                    Are you sure you want to send a new invitation to this user?
                </EditSubheading>
            </EditOption>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            <OptionButtonsDiv>
                <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faEnvelope} />}
                    onClick={onOk}
                    type="submit"
                >
                    OK
                </Button>
                <Button variant="outlined" color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </OptionButtonsDiv>
        </form>
    );
};

export default ResendInvitationForm;
