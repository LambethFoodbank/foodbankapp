import React from "react";
import { SelectChangeEventHandler } from "@/components/DataInput/inputHandlerFactories";
import { UserRole } from "@/databaseUtils";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";

const roleLabelsAndValues: [string, UserRole][] = [
    ["Volunteer", "volunteer"],
    ["Manager", "manager"],
    ["Staff", "staff"],
    ["Admin", "admin"],
];

interface Props {
    value: UserRole;
    onChange: SelectChangeEventHandler<UserRole>;
}

const UserRoleSelect = (props: Props): React.ReactElement<any> => {
    return (
        <ControlledSelect
            selectLabelId="user-role-select-label"
            listTitle="User Role"
            value={props.value}
            labelsAndValues={roleLabelsAndValues}
            onChange={props.onChange}
        />
    );
};

export default UserRoleSelect;
