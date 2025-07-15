import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { getErrorText, onChangeText } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ParcelCardProps } from "../ParcelForm";

const voucherNumberIsRequired = true;

const VoucherNumberCard: React.FC<ParcelCardProps> = ({
    errorSetter,
    fieldSetter,
    formErrors,
    fields,
}) => {
    return (
        <GenericFormCard
            title="Voucher Number"
            required={voucherNumberIsRequired}
            text="This is usually found in the following format: E-00000-00000."
        >
            <FreeFormTextInput
                label="Voucher Number"
                onChange={onChangeText(fieldSetter, errorSetter, "voucherNumber", {
                    required: voucherNumberIsRequired,
                })}
                value={fields.voucherNumber ?? undefined}
            />
            <ErrorText>{getErrorText(formErrors.voucherNumber)}</ErrorText>
        </GenericFormCard>
    );
};
export default VoucherNumberCard;
