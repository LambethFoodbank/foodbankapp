import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { errorExists, getErrorText, onChangeText } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText, GappedDiv } from "@/components/Form/formStyling";
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
            text="This is usually found in the following format: H-00001-00001. If you don't know the voucher number, leave this section blank."
        >
            <GappedDiv>
                <FreeFormTextInput
                    label="Voucher Number*"
                    error={errorExists(formErrors.voucherNumber)}
                    helperText={getErrorText(formErrors.voucherNumber)}
                    onChange={onChangeText(fieldSetter, errorSetter, "voucherNumber", {
                        required: voucherNumberIsRequired,
                    })}
                    value={fields.voucherNumber ?? undefined}
                />
                <FreeFormTextInput
                    label="Referral Agency"
                    onChange={onChangeText(fieldSetter, errorSetter, "referralAgency", {
                        required: false,
                    })}
                    value={fields.referralAgency ?? undefined}
                />
                <FreeFormTextInput
                    label="Referrer Name"
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerName", {
                        required: false,
                    })}
                    value={fields.referrerName ?? undefined}
                />
                <FreeFormTextInput
                    label="Referrer Email"
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerEmail", {
                        required: false,
                    })}
                    value={fields.referrerEmail ?? undefined}
                />
                <FreeFormTextInput
                    label="Referrer Phone"
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerPhone", {
                        required: false,
                    })}
                    value={fields.referrerPhone ?? undefined}
                />
            </GappedDiv>
        </GenericFormCard>
    );
};
export default VoucherNumberCard;
