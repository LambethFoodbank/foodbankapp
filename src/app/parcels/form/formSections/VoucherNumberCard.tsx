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
                />
                <FreeFormTextInput
                    label="Referral Agency"
                    onChange={onChangeText(fieldSetter, errorSetter, "referralAgency", {
                        required: false,
                    })}
                />
                <FreeFormTextInput
                    label="Referrer Name"
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerName", {
                        required: false,
                    })}
                />
                <FreeFormTextInput
                    label="Referrer Email"
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerEmail", {
                        required: false,
                    })}
                />
                <FreeFormTextInput
                    label="Referrer Phone"
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerPhone", {
                        required: false,
                    })}
                />
            </GappedDiv>
        </GenericFormCard>
    );
};
export default VoucherNumberCard;
