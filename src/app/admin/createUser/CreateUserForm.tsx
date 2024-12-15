"use client";

import React, { useState } from "react";
import { CenterComponent, StyledForm } from "@/components/Form/formStyling";
import Button from "@mui/material/Button";
import AccountDetailsCard from "@/app/admin/createUser/AccountDetailsCard";
import UserRoleCard from "@/app/admin/createUser/UserRoleCard";
import {
    checkErrorOnSubmit,
    Errors,
    FormErrors,
    createSetter,
    CardProps,
} from "@/components/Form/formFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Alert from "@mui/material/Alert/Alert";
import { User } from "@supabase/gotrue-js";
import { logInfoReturnLogId } from "@/logger/logger";
import UserDetailsCard from "@/app/admin/createUser/UserDetailsCard";
import { InviteUserError, adminInviteUser } from "@/server/adminInviteUser";
import { UserRole } from "@/databaseUtils";

export interface InviteUserFields extends Record<string, UserRole | string> {
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    telephoneNumber: string;
}

type InviteUserErrors = Required<FormErrors<InviteUserFields>>;

export type InviteUserCardProps = CardProps<InviteUserFields, InviteUserErrors>;

export interface UserFormProps extends InviteUserCardProps {
    clearInvitedUser: () => void;
}

const initialFieldValues: InviteUserFields = {
    email: "",
    role: "volunteer",
    firstName: "",
    lastName: "",
    telephoneNumber: "",
};

const initialFormErrors: InviteUserErrors = {
    email: Errors.initial,
    role: Errors.none,
    firstName: Errors.initial,
    lastName: Errors.initial,
    telephoneNumber: Errors.none,
};

const getServerErrorMessage = (serverError: InviteUserError): string => {
    switch (serverError.type) {
        case "adminAuthenticationFailure":
            return "Failed to authenticate user as an admin. Please try again later.";
        case "inviteUserFailure":
            return "Failed to invite the new user. Please try again later.";
        case "createProfileFailure":
            return "Failed to create a profile for the new user. Please try again later.";
    }
};

const CreateUserForm: React.FC = () => {
    const [fields, setFields] = useState(initialFieldValues);
    const [formErrors, setFormErrors] = useState(initialFormErrors);

    const fieldSetter = createSetter(setFields, fields);
    const errorSetter = createSetter(setFormErrors, formErrors);

    const [formError, setFormError] = useState(Errors.none);
    const [submitDisabled, setSubmitDisabled] = useState(false);

    const [serverError, setServerError] = useState<InviteUserError | null>(null);

    const [invitedUser, setInvitedUser] = useState<User | null>(null);

    const submitForm = async (): Promise<void> => {
        setSubmitDisabled(true);
        setFormError(Errors.none);
        setServerError(null);

        if (checkErrorOnSubmit<InviteUserFields, InviteUserErrors>(formErrors, setFormErrors)) {
            setFormError(Errors.submit);
            setSubmitDisabled(false);
            return;
        }

        const redirectUrl = `${window.location.origin}/set-password`;

        const { data, error } = await adminInviteUser(fields, redirectUrl);

        if (error) {
            setServerError(error);
            setSubmitDisabled(false);
            setInvitedUser(null);
            return;
        }

        setFormError(Errors.none);
        setSubmitDisabled(false);

        setInvitedUser(data);
        void logInfoReturnLogId(
            `User ${fields.email} with role ${fields.role} invited successfully, given redirect URL ${redirectUrl}`
        );
        setFields(initialFieldValues);
    };

    return (
        <CenterComponent>
            <StyledForm $compact={true}>
                <AccountDetailsCard
                    fields={fields}
                    fieldSetter={fieldSetter}
                    formErrors={formErrors}
                    errorSetter={errorSetter}
                    clearInvitedUser={() => setInvitedUser(null)}
                />
                <UserDetailsCard
                    fields={fields}
                    fieldSetter={fieldSetter}
                    formErrors={formErrors}
                    errorSetter={errorSetter}
                    clearInvitedUser={() => setInvitedUser(null)}
                />
                <UserRoleCard
                    fields={fields}
                    fieldSetter={fieldSetter}
                    formErrors={formErrors}
                    errorSetter={errorSetter}
                />
                <Button
                    startIcon={<FontAwesomeIcon icon={faUserPlus} />}
                    variant="contained"
                    onClick={submitForm}
                    disabled={submitDisabled}
                >
                    Invite User
                </Button>
                {invitedUser && (
                    <Alert severity="success">
                        User <b>{invitedUser.email}</b> invited successfully.
                    </Alert>
                )}
                {serverError && (
                    <Alert severity="error">{`${getServerErrorMessage(serverError)} Log ID: ${serverError.logId}`}</Alert>
                )}
                {formError && <Alert severity="error">{formError}</Alert>}
            </StyledForm>
        </CenterComponent>
    );
};

export default CreateUserForm;
