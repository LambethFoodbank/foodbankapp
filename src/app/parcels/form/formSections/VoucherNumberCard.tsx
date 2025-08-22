import React from "react";
import { emailRegex, phoneNumberRegex } from "@/common/format";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    FormErrors,
    getErrorText,
    onChangeText,
    Setter,
} from "@/components/Form/formFunctions";
import { GappedDiv } from "@/components/Form/formStyling";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps, ParcelFields } from "../ParcelForm";

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
            text="This is usually found in the following format: E-000000-000000 or E-00000-000000."
        >
            <GappedDiv>
                <FreeFormTextInput
                    label="Voucher Number*"
                    error={errorExists(formErrors.voucherNumber)}
                    helperText={getErrorText(formErrors.voucherNumber)}
                    onChange={onChangeText(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ParcelFields>>,
                        "voucherNumber",
                        {
                            required: voucherNumberIsRequired,
                        }
                    )}
                    defaultValue={fields.voucherNumber}
                />
                <FreeFormTextInput
                    label="Referral Agency"
                    onChange={onChangeText(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ParcelFields>>,
                        "referralAgency",
                        {
                            required: false,
                        }
                    )}
                    defaultValue={fields.referralAgency}
                />
                <FreeFormTextInput
                    label="Referrer Name"
                    onChange={onChangeText(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ParcelFields>>,
                        "referrerName",
                        {
                            required: false,
                        }
                    )}
                    defaultValue={fields.referrerName}
                />
                <FreeFormTextInput
                    label="Referrer Email"
                    error={errorExists(formErrors.referrerEmail)}
                    helperText={
                        formErrors.referrerEmail
                            ? getErrorText(formErrors.referrerEmail)
                            : undefined
                    }
                    onChange={onChangeText(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ParcelFields>>,
                        "referrerEmail",
                        {
                            required: false,
                            regex: emailRegex,
                        }
                    )}
                    defaultValue={fields.referrerEmail}
                />
                <FreeFormTextInput
                    label="Referrer Phone"
                    error={errorExists(formErrors.referrerPhone)}
                    helperText={
                        formErrors.referrerPhone
                            ? getErrorText(formErrors.referrerPhone)
                            : undefined
                    }
                    onChange={onChangeText(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ParcelFields>>,
                        "referrerPhone",
                        {
                            required: false,
                            regex: phoneNumberRegex,
                        }
                    )}
                    defaultValue={fields.referrerPhone}
                />
            </GappedDiv>
        </GenericFormCard>
    );
};
export default VoucherNumberCard;
