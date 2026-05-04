"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import InfoIcon from "@mui/icons-material/Info";
import { Button, IconButton } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
    CardProps,
    checkboxGroupToArray,
    checkErrorOnSubmit,
    createSetter,
    Errors,
    Fields,
    FormErrors,
} from "@/components/Form/formFunctions";
import {
    CenterComponent,
    FormErrorText,
    StyledForm,
    StyledName,
} from "@/components/Form/formStyling";
import Icon from "@/components/Icons/Icon";
import Modal from "@/components/Modal/Modal";
import { Schema } from "@/databaseUtils";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import ExpandedClientDetails from "@/app/clients/ExpandedClientDetails";
import { ClientErrors, ClientFields } from "@/app/clients/form/ClientForm";
import getExpandedClientDetails, {
    ExpandedClientData,
} from "@/app/clients/getExpandedClientDetails";
import CollectionCentreCard from "@/app/parcels/form/formSections/CollectionCentreCard";
import CollectionDateCard from "@/app/parcels/form/formSections/CollectionDateCard";
import CollectionSlotCard from "@/app/parcels/form/formSections/CollectionSlotCard";
import DeliveryInstructionsCard from "@/common/formSections/DeliveryInstructionsCard";
import PackingDateCard from "@/app/parcels/form/formSections/PackingDateCard";
import PackingSlotsCard from "@/app/parcels/form/formSections/PackingSlotsCard";
import ShippingMethodCard from "@/app/parcels/form/formSections/ShippingMethodCard";
import VoucherNumberCard from "@/app/parcels/form/formSections/VoucherNumberCard";
import {
    switchErrorForCollectionCentre,
    switchErrorForCollectionDate,
    switchErrorForCollectionSlot,
    WriteParcelToDatabaseErrors,
    WriteParcelToDatabaseFunction,
} from "@/app/parcels/form/submitFormHelpers";
import { ListType, ListTypeLabelsAndValues } from "@/common/databaseListTypes";
import {
    CollectionCentresLabelsAndValues,
    CollectionTimeSlotsLabelsAndValues,
    getActiveTimeSlotsForCollectionCentre,
    PackingSlotsLabelsAndValues,
    DbAvailableDaysType,
    DbCollectionCentreWithAvailableDaysType,
    getAvailableDaysForCollectionCentres,
} from "@/common/fetch";
import { getDbDate } from "@/common/format";
import supabase from "@/supabaseClient";
import ListTypeCard from "./formSections/ListTypeCard";
import ParcelNotesCard from "@/app/parcels/form/formSections/ParcelNotes";
import AttentionFlagCard from "@/app/parcels/form/formSections/AttentionFlagCard";
import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";
import SignpostingCallCard from "@/app/parcels/form/formSections/SignpostingCallCard";
import ExtraInformationCard from "@/app/parcels/form/formSections/ExtraInformationCard";

export interface ParcelFields extends Fields {
    clientId: string | null;
    listType: ListType | null;
    voucherNumber: string | undefined;
    referralAgency: string | undefined;
    referrerName: string | undefined;
    referrerEmail: string | undefined;
    referrerPhone: string | undefined;
    packingDate: string | null;
    packingSlot: string | undefined;
    shippingMethod: string | null;
    collectionDate: string | null;
    collectionSlot: string | null;
    collectionCentre: string | null;
    lastUpdated: string | undefined;
    deliveryInstructions: string | null;
    notes: string | null;
    attentionFlag: boolean | null;
    signpostingCall: boolean | null;
    signpostingCallReasons: BooleanGroup | null;
    extraInformation: string | null;
}

export interface ParcelErrors extends FormErrors<ParcelFields> {
    listType: Errors;
    voucherNumber: Errors;
    packingDate: Errors;
    packingSlot: Errors;
    shippingMethod: Errors;
    collectionDate: Errors;
    collectionSlot: Errors;
    collectionCentre: Errors;
    deliveryInstructions: Errors;
    referrerEmail: Errors;
    referrerPhone: Errors;
}

export type CommonFields = ParcelFields | ClientFields;
export type CommonErrors = ParcelErrors | ClientErrors;

export type ParcelCardProps = CardProps<ParcelFields, ParcelErrors>;
export type CommonCardProps = CardProps<CommonFields, CommonErrors>;

export const initialParcelFields: ParcelFields = {
    clientId: null,
    listType: "regular",
    voucherNumber: "",
    referralAgency: "",
    referrerName: "",
    referrerEmail: "",
    referrerPhone: "",
    packingDate: null,
    packingSlot: "",
    shippingMethod: null,
    collectionDate: null,
    collectionSlot: null,
    collectionCentre: null,
    lastUpdated: undefined,
    deliveryInstructions: null,
    notes: null,
    attentionFlag: null,
    signpostingCall: null,
    signpostingCallReasons: null,
    extraInformation: "",
};

export const initialParcelFormErrors: ParcelErrors = {
    listType: Errors.none,
    voucherNumber: Errors.initial,
    packingDate: Errors.initial,
    packingSlot: Errors.initial,
    shippingMethod: Errors.initial,
    collectionDate: Errors.initial,
    collectionSlot: Errors.initial,
    collectionCentre: Errors.initial,
    deliveryInstructions: Errors.none,
    referralAgency: Errors.none,
    referrerName: Errors.none,
    referrerEmail: Errors.none,
    referrerPhone: Errors.none,
};

interface ParcelFormProps {
    initialFields: ParcelFields;
    initialFormErrors: ParcelErrors;
    clientId?: string;
    deliveryPrimaryKey: Schema["collection_centres"]["primary_key"];
    collectionCentresLabelsAndValues: CollectionCentresLabelsAndValues;
    packingSlotsLabelsAndValues: PackingSlotsLabelsAndValues;
    writeParcelInfoToDatabase: WriteParcelToDatabaseFunction;
    listTypeLabelsAndValues: ListTypeLabelsAndValues;
    returnPath?: string | null;
}

const withCollectionFormSections = [
    ListTypeCard,
    VoucherNumberCard,
    PackingDateCard,
    PackingSlotsCard,
    ShippingMethodCard,
    CollectionCentreCard,
    CollectionDateCard,
    CollectionSlotCard,
    AttentionFlagCard,
    SignpostingCallCard,
    ExtraInformationCard,
    ParcelNotesCard,
];

const noCollectionFormSections = [
    ListTypeCard,
    VoucherNumberCard,
    PackingDateCard,
    PackingSlotsCard,
    ShippingMethodCard,
    AttentionFlagCard,
    SignpostingCallCard,
    ExtraInformationCard,
    DeliveryInstructionsCard,
    ParcelNotesCard,
];

export const mergeDateAndTime = (date: string, time: string): Dayjs => {
    // dayjs objects are immutable so the setter methods return a new object
    dayjs.extend(customParseFormat);
    const dayjsTime = dayjs(time, "HH:mm:ss");
    return dayjs(date).hour(dayjsTime.hour()).minute(dayjsTime.minute()).second(dayjsTime.second());
};

const parcelModalRouterPath = (parcelId: string): string => `/parcels?parcelId=${parcelId}`;

const databaseErrorMessageFromErrorType = (
    errorType: WriteParcelToDatabaseErrors,
    logId: string
): string => {
    switch (errorType) {
        case "failedToInsertParcel":
            return `Failed to insert parcel. Log ID: ${logId}`;
        case "failedToUpdateParcel":
            return `Failed to update parcel. Log ID: ${logId}`;
        case "concurrentUpdateConflict":
            return `Record has been edited recently - please refresh the page. LogID: ${logId}`;
    }
};

const ParcelForm: React.FC<ParcelFormProps> = ({
    initialFields,
    initialFormErrors,
    clientId,
    writeParcelInfoToDatabase,
    deliveryPrimaryKey,
    collectionCentresLabelsAndValues,
    packingSlotsLabelsAndValues,
    listTypeLabelsAndValues,
    returnPath,
}) => {
    const router = useRouter();
    const [fields, setFields] = useState(initialFields);
    const [formErrors, setFormErrors] = useState(initialFormErrors);
    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [clientDetails, setClientDetails] = useState<ExpandedClientData | null>(null);
    const [collectionSlotsLabelsAndValues, setCollectionSlotsLabelsAndValues] =
        useState<CollectionTimeSlotsLabelsAndValues>([]);
    const [collectionCentreIsActive, setCollectionCentreIsActive] = useState<boolean>(true);
    const [collectionAvailableDays, setAvailableDays] = useState<
        DbCollectionCentreWithAvailableDaysType[]
    >([]);
    const [availableDaysForCentre, setAvailableDaysForCentre] = useState<DbAvailableDaysType>([]);
    const theme = useTheme();
    const clientIdForFetch = initialFields.clientId ? initialFields.clientId : clientId;

    useEffect(() => {
        if (!clientDetails && clientIdForFetch) {
            getExpandedClientDetails(clientIdForFetch)
                .then((response) => {
                    setClientDetails(response);
                })
                .catch(() => {
                    setClientDetails(null);
                });
        }
    }, [clientDetails, clientIdForFetch]);

    useEffect(() => {
        const centreIsActive = collectionCentresLabelsAndValues.some(
            (centre) => centre[1] === fields.collectionCentre
        );
        setCollectionCentreIsActive(centreIsActive);
    }, [collectionCentresLabelsAndValues, fields.collectionCentre]);

    useEffect(() => {
        const getTimeSlots = async (): Promise<void> => {
            if (fields.collectionCentre) {
                const { data, error } = await getActiveTimeSlotsForCollectionCentre(
                    fields.collectionCentre,
                    supabase
                );

                if (error) {
                    let errorMessage;
                    switch (error.type) {
                        case "collectionTimeSlotsFetchFailed":
                            errorMessage = "Failed to fetch collection time slots";
                            break;
                    }
                    setSubmitErrorMessage(`${errorMessage}. Log ID: ${error.logId}`);
                    return;
                }

                setCollectionSlotsLabelsAndValues(data);
            }
        };

        void getTimeSlots();
    }, [fields.collectionCentre, initialFormErrors]);

    useEffect(() => {
        const getAvailableDaysForCentre = async (
            collectionCentre: string | null
        ): Promise<void> => {
            if (fields.collectionCentre) {
                const availableDays = collectionAvailableDays.find(
                    (centre) => centre?.primary_key == collectionCentre
                )?.available_days;

                if (availableDays) {
                    setAvailableDaysForCentre(availableDays);
                }
            }
        };

        void getAvailableDaysForCentre(fields.collectionCentre);
    }, [collectionAvailableDays, fields.collectionCentre]);

    useEffect(() => {
        const getAvailableDays = async (): Promise<void> => {
            const { data, error } = await getAvailableDaysForCollectionCentres(supabase);

            if (error) {
                const errorMessages = {
                    collectionAvailableDaysFetchFailed:
                        "Failed to fetch collection centre available days",
                };

                const errorMessage = errorMessages[error.type] || "An unexpected error occurred";
                setSubmitErrorMessage(`${errorMessage}. Log ID: ${error.logId}`);
                return;
            }

            setAvailableDays(data);
        };

        void getAvailableDays();
    }, []);

    useEffect(() => {
        // If the Shipping Method changes, errors for collection date and slot should be reset
        if (fields.shippingMethod == "Collection") {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                collectionCentre: switchErrorForCollectionCentre(
                    fields,
                    collectionCentreIsActive,
                    deliveryPrimaryKey
                ),
                collectionDate: switchErrorForCollectionDate(
                    fields,
                    collectionCentreIsActive,
                    availableDaysForCentre
                ),
                collectionSlot: switchErrorForCollectionSlot(
                    fields,
                    collectionCentreIsActive,
                    collectionSlotsLabelsAndValues,
                    availableDaysForCentre
                ),
            }));
        }
    }, [
        availableDaysForCentre,
        collectionCentreIsActive,
        collectionSlotsLabelsAndValues,
        deliveryPrimaryKey,
        fields,
        fields.collectionCentre,
        fields.collectionDate,
        fields.collectionSlot,
        fields.shippingMethod,
    ]);

    const formSections =
        fields.shippingMethod === "Collection"
            ? withCollectionFormSections
            : noCollectionFormSections;

    const fieldSetter = createSetter(setFields, fields);
    const errorSetter = createSetter(setFormErrors, formErrors);

    const submitForm = async (): Promise<void> => {
        setSubmitErrorMessage("");
        setSubmitDisabled(true);
        let inputError;
        if (fields.shippingMethod === "Collection") {
            inputError = checkErrorOnSubmit(formErrors, setFormErrors);
        } else {
            inputError = checkErrorOnSubmit(formErrors, setFormErrors, [
                "voucherNumber",
                "referrerEmail",
                "referrerPhone",
                "packingDate",
                "packingSlot",
                "shippingMethod",
            ]);
        }
        if (inputError) {
            setSubmitErrorMessage(Errors.submit);
            setSubmitDisabled(false);
            return;
        }

        const packingDate = getDbDate(dayjs(fields.packingDate));

        let collectionDateTime = null;
        if (
            fields.shippingMethod === "Collection" &&
            fields.collectionDate &&
            fields.collectionSlot
        ) {
            collectionDateTime = mergeDateAndTime(
                fields.collectionDate,
                fields.collectionSlot
            ).toISOString();
        }

        const isDelivery = fields.shippingMethod === "Delivery";

        const parcelRecord = {
            client_id: clientId || fields.clientId || "",
            list_type: fields.listType ?? undefined,
            packing_date: packingDate,
            packing_slot: fields.packingSlot,
            voucher_number: fields.voucherNumber,
            collection_centre: isDelivery ? deliveryPrimaryKey : fields.collectionCentre,
            collection_datetime: collectionDateTime,
            last_updated: fields.lastUpdated,
            delivery_instructions: fields.delivery_instructions,
            referral_agency: fields.referralAgency,
            referrer_name: fields.referrerName,
            referrer_email: fields.referrerEmail,
            referrer_phone: fields.referrerPhone,
            notes: fields.notes,
            flagged_for_attention: fields.attentionFlag ?? false,
            signposting_call_required: fields.signpostingCall ?? false,
            signposting_call_reasons:
                fields.signpostingCall && fields.signpostingCallReasons !== null
                    ? checkboxGroupToArray(fields.signpostingCallReasons)
                    : [],
            extra_information: fields.extraInformation ?? "",
        };

        const { parcelId, error } = await writeParcelInfoToDatabase(
            parcelRecord,
            fields.deliveryInstructions == null ? "" : fields.deliveryInstructions
        );

        if (parcelId) {
            if (returnPath) {
                router.push(decodeURIComponent(returnPath));
            } else {
                router.push(parcelModalRouterPath(parcelId));
            }
        }

        if (error) {
            if (error.type !== "concurrentUpdateConflict") {
                setSubmitDisabled(false);
            }

            setSubmitErrorMessage(databaseErrorMessageFromErrorType(error.type, error.logId));
        }
    };

    return (
        <CenterComponent>
            <StyledForm>
                {clientDetails && (
                    <StyledName>
                        <h2>{clientDetails.fullName}</h2>
                        <IconButton
                            aria-label="Button for Client Information"
                            type="button"
                            size="large"
                            onClick={() => {
                                setModalIsOpen(true);
                            }}
                        >
                            <InfoIcon />
                        </IconButton>
                    </StyledName>
                )}
                {formSections.map((Card, index) => {
                    return (
                        <Card
                            key={index} // eslint-disable-line react/no-array-index-key
                            formErrors={formErrors}
                            errorSetter={errorSetter}
                            fieldSetter={fieldSetter}
                            fields={fields}
                            deliveryPrimaryKey={deliveryPrimaryKey}
                            collectionCentreIsActive={collectionCentreIsActive}
                            collectionCentresLabelsAndValues={collectionCentresLabelsAndValues}
                            packingSlotsLabelsAndValues={packingSlotsLabelsAndValues}
                            collectionTimeSlotsLabelsAndValues={collectionSlotsLabelsAndValues}
                            collectionAvailableDays={collectionAvailableDays}
                            availableDaysForSelectedCentre={availableDaysForCentre}
                            listTypeLabelsAndValues={listTypeLabelsAndValues}
                        />
                    );
                })}
                <CenterComponent>
                    <Button variant="contained" onClick={submitForm} disabled={submitDisabled}>
                        Submit
                    </Button>
                </CenterComponent>
                <FormErrorText>{submitErrorMessage}</FormErrorText>
            </StyledForm>
            {clientIdForFetch && (
                <Modal
                    header={
                        <>
                            <Icon icon={faUser} color={theme.primary.background[2]} />
                            <h2>Client Details</h2>
                        </>
                    }
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    headerId="clientsDetailModal"
                >
                    <ExpandedClientDetails clientId={clientIdForFetch} />
                </Modal>
            )}
        </CenterComponent>
    );
};

export default ParcelForm;
