import React from "react";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ParcelCardProps } from "../ParcelForm";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { CollectionTimeSlotsLabelsAndValues, DbAvailableDaysType } from "@/common/fetch";
import { Schema } from "@/databaseUtils";

interface CollectionSlotsCardProps extends ParcelCardProps {
    deliveryPrimaryKey: Schema["collection_centres"]["primary_key"];
    collectionTimeSlotsLabelsAndValues: CollectionTimeSlotsLabelsAndValues;
    availableDaysForSelectedCentre: DbAvailableDaysType;
}

const CollectionSlotCard: React.FC<CollectionSlotsCardProps> = ({
    errorSetter,
    fieldSetter,
    formErrors,
    fields,
    deliveryPrimaryKey,
    availableDaysForSelectedCentre,
    collectionTimeSlotsLabelsAndValues,
}) => {
    const isDisabledFormInput =
        !fields.collectionCentre ||
        fields.collectionCentre == deliveryPrimaryKey ||
        !availableDaysForSelectedCentre?.find((dayObject) => dayObject.is_active);

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
                    disabled={isDisabledFormInput}
                />
                <ErrorText>{getErrorText(formErrors.collectionSlot)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionSlotCard;
