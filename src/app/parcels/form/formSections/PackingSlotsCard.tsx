import React from "react";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { PackingSlotsLabelsAndValues } from "@/common/fetch";
import { ParcelCardProps } from "../ParcelForm";

interface PackingSlotsCardProps extends ParcelCardProps {
    packingSlotsLabelsAndValues: PackingSlotsLabelsAndValues;
}

const PackingSlotsCard: React.FC<PackingSlotsCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    packingSlotsLabelsAndValues,
}) => {
    return (
        <GenericFormCard
            title="Packing Slots"
            required={true}
            text="Which slot does the parcel need to be packed in?"
        >
            <ControlledSelect
                selectLabelId="packing-slot-select-label"
                labelsAndValues={packingSlotsLabelsAndValues}
                listTitle="Packing Slot"
                value={fields.packingSlot ?? ""}
                onChange={valueOnChangeDropdownList(fieldSetter, errorSetter, "packingSlot")}
            />
            <ErrorText>{getErrorText(formErrors.packingSlot)}</ErrorText>
        </GenericFormCard>
    );
};

export default PackingSlotsCard;
