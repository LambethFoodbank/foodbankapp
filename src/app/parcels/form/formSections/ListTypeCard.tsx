import React, { useEffect, useState } from "react";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { ParcelCardProps } from "../ParcelForm";
import { ListTypeLabelsAndValues, ListType } from "@/common/databaseListTypes";

interface ListTypeCardProps extends ParcelCardProps {
    listTypeLabelsAndValues: ListTypeLabelsAndValues;
}

const ListTypeCard: React.FC<ListTypeCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    listTypeLabelsAndValues,
}) => {
    const [clientDefaultList, setClientDefaultList] = useState<ListType | null>(null);

    useEffect(() => {
        const defaultArray = listTypeLabelsAndValues.find(([label, _]) => {
            return label.includes("default");
        }) as [string, ListType];
        setClientDefaultList(defaultArray ? defaultArray[1] : null);
    }, [listTypeLabelsAndValues]);

    return (
        <GenericFormCard
            title="List Type"
            required={true}
            text={
                clientDefaultList
                    ? `Which list should be used to pack this parcel? The default list type for this client is ${clientDefaultList}.`
                    : "Which list should be used to pack this parcel?"
            }
        >
            <ControlledSelect
                key={fields.listType}
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
