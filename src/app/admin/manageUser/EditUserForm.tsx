import { UserRole } from "@/databaseUtils";
import React, { useState } from "react";
import { EditHeader, EditOption } from "@/app/admin/manageUser/ManageUserModal";
import UserRoleSelect from "@/app/admin/common/UserRoleSelect";
import { getDropdownListHandler } from "@/components/DataInput/inputHandlerFactories";
import { DisplayedUserRole, UserRow } from "@/app/admin/usersTable/types";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OptionButtonsDiv from "@/app/admin/common/OptionButtonsDiv";
import { faUserPen } from "@fortawesome/free-solid-svg-icons/faUserPen";
import { AlertOptions } from "@/app/admin/common/SuccessFailureAlert";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { updateUserProfile } from "@/app/admin/manageUser/UpdateUserProfile";
import {
    checkErrorOnSubmit,
    createSetter,
    Errors,
    FormErrors,
    onChangeText,
    errorExists,
    getErrorText,
} from "@/components/Form/formFunctions";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { InviteUserFields } from "@/app/admin/createUser/CreateUserForm";
import { formatPhoneNumber, phoneNumberRegex } from "@/common/format";
import Alert from "@mui/material/Alert/Alert";

interface Props {
    userToEdit: UserRow;
    onCancel: () => void;
    onConfirm: (alertOptions: AlertOptions) => void;
}

function isValidUserRole(userRole: DisplayedUserRole): userRole is UserRole {
    return userRole !== "UNKNOWN";
}

const initialFormErrors: InviteUserErrors = {
    email: Errors.none,
    role: Errors.none,
    firstName: Errors.none,
    lastName: Errors.none,
    telephoneNumber: Errors.none,
};

type InviteUserErrors = Required<FormErrors<InviteUserFields>>;

const EditUserForm: React.FC<Props> = (props) => {
    const initialRole: UserRole = isValidUserRole(props.userToEdit.userRole)
        ? props.userToEdit.userRole
        : "volunteer";

    const initialFirstName: string = props.userToEdit.firstName ?? "";

    const initialLastName: string = props.userToEdit.lastName ?? "";

    const initialEmail: string = props.userToEdit.email ?? "";

    const initialPhone: string = props.userToEdit.telephoneNumber ?? "";

    const initialFieldValuesOnEdit: InviteUserFields = {
        email: initialEmail,
        role: initialRole,
        firstName: initialFirstName,
        lastName: initialLastName,
        telephoneNumber: initialPhone,
    };

    const [fields, setFields] = useState(initialFieldValuesOnEdit);
    const [formErrors, setFormErrors] = useState(initialFormErrors);

    const fieldSetter = createSetter(setFields, fields);
    const errorSetter = createSetter(setFormErrors, formErrors);

    const [formError, setFormError] = useState(Errors.none);

    const onEditConfirm = async (): Promise<void> => {
        setFormError(Errors.none);

        if (checkErrorOnSubmit<InviteUserFields, InviteUserErrors>(formErrors, setFormErrors)) {
            setFormError(Errors.invalid);
            return;
        }

        const error = await updateUserProfile({
            profileId: props.userToEdit.profileId,
            role: fields.role,
            email: fields.email,
            firstName: fields.firstName,
            lastName: fields.lastName,
            phoneNumber: fields.telephoneNumber,
        });

        if (!error) {
            props.onConfirm({
                success: true,
                message: (
                    <>
                        User <b>{props.userToEdit.email}</b> updated successfully.
                    </>
                ),
            });
            void logInfoReturnLogId(`User ${props.userToEdit.email} updated successfully`);
        } else {
            const logId = await logErrorReturnLogId("Error with edit: User profile", error);
            props.onConfirm({
                success: false,
                message: <>Edit User Operation Failed. Log ID: {logId}</>,
            });
        }
    };

    return (
        <>
            <EditOption>
                <EditHeader>First Name</EditHeader>
                <FreeFormTextInput
                    id="edit-user-first-name"
                    label="First Name"
                    defaultValue={fields.firstName}
                    error={errorExists(formErrors.firstName)}
                    helperText={getErrorText(formErrors.firstName)}
                    onChange={onChangeText(fieldSetter, errorSetter, "firstName", {
                        required: true,
                    })}
                    fullWidth={true}
                />
            </EditOption>
            <EditOption>
                <EditHeader>Last Name</EditHeader>
                <FreeFormTextInput
                    id="edit-user-last-name"
                    label="Last Name"
                    defaultValue={fields.lastName}
                    error={errorExists(formErrors.lastName)}
                    helperText={getErrorText(formErrors.lastName)}
                    onChange={onChangeText(fieldSetter, errorSetter, "lastName", {
                        required: true,
                    })}
                    fullWidth={true}
                />
            </EditOption>
            <EditOption>
                <EditHeader>Phone Number</EditHeader>
                <FreeFormTextInput
                    id="edit-user-phone-number"
                    label="Phone Number"
                    defaultValue={fields.telephoneNumber}
                    error={errorExists(formErrors.telephoneNumber)}
                    helperText={getErrorText(formErrors.telephoneNumber)}
                    onChange={onChangeText(fieldSetter, errorSetter, "telephoneNumber", {
                        required: true,
                        regex: phoneNumberRegex,
                        formattingFunction: formatPhoneNumber,
                    })}
                    fullWidth={true}
                />
            </EditOption>
            <EditOption>
                <EditHeader>Role</EditHeader>
                <UserRoleSelect
                    value={initialRole}
                    onChange={getDropdownListHandler<UserRole>(
                        (userRole: UserRole) => fieldSetter({ role: userRole }),
                        (value: UserRole | string): value is UserRole =>
                            (value as UserRole) !== undefined
                    )}
                />
            </EditOption>

            {formError && <Alert severity="error">{formError}</Alert>}
            <OptionButtonsDiv>
                <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faUserPen} />}
                    onClick={onEditConfirm}
                >
                    Confirm Edit
                </Button>
                <Button color="secondary" onClick={props.onCancel}>
                    Cancel
                </Button>
            </OptionButtonsDiv>
        </>
    );
};

export default EditUserForm;
