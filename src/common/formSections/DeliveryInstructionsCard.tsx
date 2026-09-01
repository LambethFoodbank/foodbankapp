import React from "react";
import { CommonCardProps } from "@/app/parcels/form/ParcelForm";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    getDefaultTextValue,
    onChangeText,
    Setter,
    FormErrors,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientFields } from "@/app/clients/form/ClientForm";
import { Alert } from "@mui/material";

export const MAX_CHARACTERS = 380;

const DeliveryInstructionsCard: React.FC<CommonCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    return (
        <GenericFormCard
            title="Delivery Instructions"
            required={false}
            text="For example: The doorbell does not work, use the door code: 123456."
        >
            <Alert severity="info" variant="outlined">
                <p>
                    We are unable to offer time sensitive deliveries, please request the client is
                    home all day
                </p>
                <p>
                    and always ask about a safe space or neighbour to leave the parcel if they will
                    not be in.
                </p>
            </Alert>
            <br />
            <FreeFormTextInput
                label="Delivery Instructions"
                defaultValue={getDefaultTextValue(fields, "deliveryInstructions")}
                error={errorExists(formErrors.deliveryInstructions)}
                helperText={getErrorText(formErrors.deliveryInstructions, MAX_CHARACTERS)}
                onChange={onChangeText(
                    fieldSetter,
                    errorSetter as Setter<FormErrors<ClientFields>>,
                    "deliveryInstructions",
                    {
                        maxCharacters: MAX_CHARACTERS,
                    }
                )}
                multiline
            />
        </GenericFormCard>
    );
};

export default DeliveryInstructionsCard;
