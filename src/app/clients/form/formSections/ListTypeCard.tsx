import React from "react";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { ClientCardProps } from "@/app/clients/form/ClientForm";
import { LIST_TYPES_ARRAY } from "@/common/databaseListTypes";
import { capitaliseWords } from "@/common/format";

type ListTypeLabelsAndValues = [string, string][];

const ListTypeCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    const listTypeLabelsAndValues: ListTypeLabelsAndValues = LIST_TYPES_ARRAY.map((listType) => [
        capitaliseWords(listType),
        listType,
    ]);

    return (
        <GenericFormCard
            title="List Type"
            required={true}
            text="Which list should be used by default to pack parcels for this client?"
        >
            <ControlledSelect
                selectLabelId="list-type-select-label"
                labelsAndValues={listTypeLabelsAndValues}
                listTitle="List Type"
                value={fields.listType ?? ""}
                onChange={valueOnChangeDropdownList(fieldSetter, errorSetter, "listType")}
            />
            <ErrorText>{getErrorText(formErrors.listType)}</ErrorText>
        </GenericFormCard>
    );
};

export default ListTypeCard;
