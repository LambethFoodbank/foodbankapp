import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { errorExists, Errors, getErrorText, onChangeText } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText, GappedDiv } from "@/components/Form/formStyling";
import { ParcelCardProps } from "../ParcelForm";
import { emailRegex, formatPhoneNumber, phoneNumberRegex } from "@/common/format";

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
                    value={fields.voucherNumber ?? ""}
                />
                <FreeFormTextInput
                    label="Referral Agency"
                    onChange={onChangeText(fieldSetter, errorSetter, "referralAgency", {
                        required: false,
                    })}
                    value={fields.referralAgency ?? ""}
                />
                <FreeFormTextInput
                    label="Referrer Name"
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerName", {
                        required: false,
                    })}
                    value={fields.referrerName ?? ""}
                />
                <FreeFormTextInput
                    label="Referrer Email"
                    error={errorExists(formErrors.referrerEmail)}
                    helperText={
                        formErrors.referrerEmail
                            ? getErrorText(formErrors.referrerEmail)
                            : undefined
                    }
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerEmail", {
                        required: false,
                        regex: emailRegex,
                    })}
                    value={fields.referrerEmail ?? ""}
                />
                <FreeFormTextInput
                    label="Referrer Phone"
                    error={errorExists(formErrors.referrerPhone)}
                    helperText={
                        formErrors.referrerPhone
                            ? getErrorText(formErrors.referrerPhone)
                            : undefined
                    }
                    onChange={onChangeText(fieldSetter, errorSetter, "referrerPhone", {
                        required: false,
                        regex: phoneNumberRegex,
                    })}
                    value={fields.referrerPhone ?? ""}
                />
            </GappedDiv>
        </GenericFormCard>
    );
};
export default VoucherNumberCard;
