import React from "react";
import {
    CollectionCentresLabelsAndValues,
    DbAvailableDaysType,
    DbCollectionCentreWithAvailableDaysType,
} from "@/common/fetch";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { ErrorText } from "@/components/Form/formStyling";
import {
    Errors,
    FormErrors,
    getErrorText,
    Setter,
    valueOnChangeDropdownList,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps, ParcelFields } from "../ParcelForm";
import { StyledAlert } from "../../ActionBar/DuplicateDownloadWarning";

interface CollectionCentreCardProps extends ParcelCardProps {
    collectionCentresLabelsAndValues: CollectionCentresLabelsAndValues;
    collectionAvailableDays: DbCollectionCentreWithAvailableDaysType[];
    availableDaysForSelectedCentre: DbAvailableDaysType;
    deliveryPrimaryKey: string;
    collectionCentreIsActive: boolean;
}

type CollectionCentreWithAvailabilityString = {
    primary_key: string;
    availabilityString: string;
} | null;

const CollectionCentreCard: React.FC<CollectionCentreCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    collectionCentresLabelsAndValues,
    collectionAvailableDays,
    availableDaysForSelectedCentre,
}) => {
    const collectionCentresWithAvailabilityStrings: CollectionCentreWithAvailabilityString[] =
        collectionAvailableDays?.map((availableDaysObject) => {
            if (!availableDaysObject) {
                return null;
            }

            const formattedAvailabilityString = availableDaysObject.available_days
                ?.filter((collectionDayObject) => collectionDayObject.is_active)
                ?.map((collectionDayObject) => collectionDayObject.day)
                .join(", ");

            return {
                primary_key: availableDaysObject.primary_key,
                availabilityString: formattedAvailabilityString,
            };
        });

    const collectionCentresLabelsAndValuesWithDays: CollectionCentresLabelsAndValues =
        collectionCentresLabelsAndValues.map((centre) => {
            const [label, value] = centre;
            const availabilityString =
                collectionCentresWithAvailabilityStrings.find(
                    (availabilityObject) => availabilityObject?.primary_key === value
                )?.availabilityString ?? "";

            return [
                label +
                    " - " +
                    (availabilityString !== ""
                        ? availabilityString
                        : "This centre is closed all week"),
                value,
            ];
        });

    const isUnavailableCentre = (): boolean => {
        return (
            fields.collectionCentre !== null &&
            formErrors.collectionCentre === Errors.none &&
            availableDaysForSelectedCentre &&
            !availableDaysForSelectedCentre.some((day) => day.is_active)
        );
    };

    return (
        <GenericFormCard
            title="Collection Centre"
            required={true}
            text="What centre is the client collecting their parcel from?"
        >
            <>
                <ControlledSelect
                    selectLabelId="collection-centre-select-label"
                    labelsAndValues={collectionCentresLabelsAndValuesWithDays}
                    listTitle="Collection Centre"
                    value={fields.collectionCentre ?? ""}
                    onChange={valueOnChangeDropdownList(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ParcelFields>>,
                        "collectionCentre"
                    )}
                    sx={isUnavailableCentre() ? { paddingBottom: "1rem" } : undefined}
                />
                {isUnavailableCentre() && (
                    <StyledAlert severity="warning">
                        The selected collection centre is unavailable.
                    </StyledAlert>
                )}
                <ErrorText>{getErrorText(formErrors.collectionCentre)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionCentreCard;
