import React from "react";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ParcelCardProps } from "../ParcelForm";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { CollectionTimeSlotsLabelsAndValues } from "@/common/fetch";

interface CollectionSlotsCardProps extends ParcelCardProps {
    collectionTimeSlotsLabelsAndValues: CollectionTimeSlotsLabelsAndValues;
}

const CollectionSlotCard: React.FC<CollectionSlotsCardProps> = ({
    errorSetter,
    fieldSetter,
    formErrors,
    fields,
    collectionTimeSlotsLabelsAndValues,
}) => {
    return (
        <GenericFormCard
            title="Collection Slots"
            required={true}
            text="What time is the client collecting their parcel?"
        >
            <>
                <ControlledSelect
                    selectLabelId="collection-slot-select-label"
                    labelsAndValues={collectionTimeSlotsLabelsAndValues}
                    listTitle="Collection Slot"
                    value={fields.collectionSlot ?? ""}
                    onChange={valueOnChangeDropdownList(fieldSetter, errorSetter, "collectionSlot")}
                />
                <ErrorText>{getErrorText(formErrors.collectionSlot)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionSlotCard;
