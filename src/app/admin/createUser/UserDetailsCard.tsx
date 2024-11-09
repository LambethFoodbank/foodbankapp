import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    onChangeTextDeferredError,
} from "@/components/Form/formFunctions";
import React from "react";
import { UserFormProps } from "@/app/admin/createUser/CreateUserForm";
import { phoneNumberRegex } from "@/common/format";
import GenericFormCard from "@/components/Form/GenericFormCard";

const UserDetailsCard: React.FC<UserFormProps> = ({
    fields,
    fieldSetter,
    formErrors,
    errorSetter,
    clearInvitedUser,
}) => {
    return (
        <GenericFormCard
            title="User Details"
            text="Please enter the relevant information for the new user."
            required={true}
            compactVariant={true}
        >
            <FreeFormTextInput
                id="new-user-first-name"
                label="First Name"
                error={errorExists(formErrors.firstName)}
                helperText={getErrorText(formErrors.firstName)}
                value={fields.firstName}
                onChange={onChangeTextDeferredError(
                    fieldSetter,
                    errorSetter,
                    "firstName",
                    true,
                    undefined,
                    clearInvitedUser
                )}
            />
            <FreeFormTextInput
                id="new-user-last-name"
                label="Last Name"
                error={errorExists(formErrors.lastName)}
                helperText={getErrorText(formErrors.lastName)}
                value={fields.lastName}
                onChange={onChangeTextDeferredError(
                    fieldSetter,
                    errorSetter,
                    "lastName",
                    true,
                    undefined,
                    clearInvitedUser
                )}
            />
            <FreeFormTextInput
                id="new-user-phone-number"
                label="Phone Number"
                error={errorExists(formErrors.telephoneNumber)}
                helperText={getErrorText(formErrors.telephoneNumber)}
                value={fields.telephoneNumber}
                onChange={onChangeTextDeferredError(
                    fieldSetter,
                    errorSetter,
                    "telephoneNumber",
                    false,
                    phoneNumberRegex,
                    clearInvitedUser
                )}
            />
        </GenericFormCard>
    );
};

export default UserDetailsCard;
