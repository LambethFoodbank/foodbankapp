import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import {
    formatAddressFromClientDetails,
    formatBabyProducts,
    formatBreakdownOfAdultsFromFamilyDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
    formatHygieneProducts,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
import { capitaliseWords, formatDateTime, formatDatetimeAsDate } from "@/common/format";
import {
    Data,
    DataForDataViewer,
    convertDataToDataForDataViewer,
} from "@/components/DataViewer/DataViewer";
import { formatEventName } from "@/app/parcels/format";
import { ListType } from "@/common/databaseListTypes";
import { cookingFacilitiesOptions } from "@/app/clients/form/formSections/CookingFacilitiesCard";
import { dietaryRequirementOptions } from "@/app/clients/form/formSections/DietaryRequirementCard";
import { otherRequirementOptions } from "@/app/clients/form/formSections/OtherItemsCard";
import { petFoodOptions } from "@/app/clients/form/formSections/PetFoodCard";
import { signpostingCallOptions } from "@/app/clients/form/formSections/SignpostingCallCard";
import { EventTableRow } from "@/app/parcels/EventTable";

type FetchExpandedParcelDetailsResult =
    | {
          parcelDetails: ExpandedParcelDetails;
          error: null;
      }
    | {
          parcelDetails: null;
          error: FetchExpandedParcelDetailsError;
      };

export interface FetchExpandedParcelDetailsError {
    type: FetchExpandedParcelDetailsErrorType;
    logId: string;
}

type FetchExpandedParcelDetailsErrorType =
    | "failedToFetchParcelDetails"
    | "clientDetailDoesNotExist";

const getExpandedEmergencyBagDetails = async (
    parcelId: string
): Promise<FetchExpandedParcelDetailsResult> => {
    const { data: rawParcelDetails, error } = await supabase
        .from("parcels")
        .select(
            `
        voucher_number,
        referral_agency,
        referrer_name,
        referrer_email,
        referrer_phone,
        packing_date,
        created_at,
        collection_datetime,
        list_type,
        notes,
        packing_slot: packing_slots (
            name
         ),
        collection_centre:collection_centres (
            name,
            is_delivery,
            is_shown
         ),
        client:clients(
            primary_key,
            full_name,
            phone_number,
            email,
            delivery_instructions,
            address_1,
            address_2,
            address_town,
            address_county,
            address_postcode,
            is_active,
            cooking_facilities,
            dietary_requirements,
            hygiene_tampons,
            hygiene_pads,
            hygiene_other_items,
            baby_food,
            baby_formula,
            baby_nappies,
            baby_other_items,
            pet_food,
            other_items,
            extra_information,
            signposting_call_required,
            signposting_call_reasons,
            notes,

            family:families(
                birth_year,
                birth_month,
                gender,
                recorded_as_child
            )
        ),
        events:events (
            new_parcel_status,
            timestamp,
            event_data
        )
    `
        )
        .eq("primary_key", parcelId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch expanded parcel details", {
            error,
        });
        return {
            parcelDetails: null,
            error: {
                type: "failedToFetchParcelDetails",
                logId,
            },
        };
    }

    const client = rawParcelDetails.client;

    if (client === null) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch client details when fetching expanded parcel details",
            { dbParcelDetails: rawParcelDetails }
        );

        return {
            parcelDetails: null,
            error: {
                type: "clientDetailDoesNotExist",
                logId,
            },
        };
    }

    const clientIsActive = client.is_active;

    if (clientIsActive) {
        return {
            parcelDetails: {
                expandedParcelData: {
                    isActive: true,
                    clientId: client.primary_key,
                    voucherNumber: rawParcelDetails.voucher_number ?? "",
                    referralDetails: formatReferralDetails(
                        rawParcelDetails.referral_agency ?? "",
                        rawParcelDetails.referrer_name ?? "",
                        rawParcelDetails.referrer_email ?? "",
                        rawParcelDetails.referrer_phone ?? ""
                    ),
                    fullName: client.full_name ?? "",
                    listType: rawParcelDetails.list_type,
                    address: formatAddressFromClientDetails(client),
                    packingDateAndSlot: formatPackingDateAndSlot(
                        rawParcelDetails.packing_date,
                        rawParcelDetails.packing_slot?.name
                    ),
                    deliveryOrCollection: formatDeliveryOrCollection(
                        rawParcelDetails.collection_centre?.name,
                        rawParcelDetails.collection_centre?.is_delivery,
                        rawParcelDetails.collection_centre?.is_shown,
                        rawParcelDetails.collection_datetime
                    ),
                    deliveryInstructions: client.delivery_instructions ?? "",
                    parcelNotes: rawParcelDetails.notes ?? "",
                    phoneNumber: client.phone_number ?? "",
                    email: client.email ?? "",
                    household: formatHouseholdFromFamilyDetails(client.family),
                    adults: formatBreakdownOfAdultsFromFamilyDetails(client.family),
                    children: formatBreakdownOfChildrenFromFamilyDetails(client.family),
                    cookingFacilities: formatRequirementsByCanonicalOrder(
                        client.cooking_facilities,
                        cookingFacilitiesOptions
                    ),
                    dietaryRequirements: formatRequirementsByCanonicalOrder(
                        client.dietary_requirements,
                        dietaryRequirementOptions
                    ),
                    hygieneProducts: formatHygieneProducts(
                        client.hygiene_tampons,
                        client.hygiene_pads,
                        client.hygiene_other_items
                    ),
                    babyProducts: formatBabyProducts(
                        client.baby_food,
                        client.baby_formula,
                        client.baby_nappies,
                        client.baby_other_items
                    ),
                    petFood: formatRequirementsByCanonicalOrder(client.pet_food, petFoodOptions),
                    otherRequirements: formatRequirementsByCanonicalOrder(
                        client.other_items,
                        otherRequirementOptions
                    ),
                    extraInformation: client.extra_information ?? "",
                    signpostingCall: formatSignpostingCall(
                        client.signposting_call_required,
                        client.signposting_call_reasons
                    ),
                    clientNotes: client.notes ?? "",
                    createdAt: formatDateTime(rawParcelDetails.created_at),
                },
                events: processEventsDetails(rawParcelDetails.events),
            },
            error: null,
        };
    }
    return {
        parcelDetails: {
            expandedParcelData: {
                isActive: false,
                clientId: client.primary_key,
                voucherNumber: rawParcelDetails.voucher_number ?? "",
                referralDetails: formatReferralDetails(
                    rawParcelDetails.referral_agency ?? "",
                    rawParcelDetails.referrer_name ?? "",
                    rawParcelDetails.referrer_email ?? "",
                    rawParcelDetails.referrer_phone ?? ""
                ),
                listType: rawParcelDetails.list_type,
                clientNotes: client.notes,
                parcelNotes: rawParcelDetails.notes,
                packingDateAndSlot: formatPackingDateAndSlot(
                    rawParcelDetails.packing_date,
                    rawParcelDetails.packing_slot?.name
                ),
                deliveryOrCollection: formatDeliveryOrCollection(
                    rawParcelDetails.collection_centre?.name,
                    rawParcelDetails.collection_centre?.is_delivery,
                    rawParcelDetails.collection_centre?.is_shown,
                    rawParcelDetails.collection_datetime
                ),
                createdAt: formatDateTime(rawParcelDetails.created_at),
            },
            events: processEventsDetails(rawParcelDetails.events),
        },
        error: null,
    };
};

interface ParcelDataIndependentOfClient extends Data {
    voucherNumber: string;
    packingDateAndSlot: string;
    deliveryOrCollection: string;
    createdAt: string;
    listType: ListType;
    referralDetails: string;
    parcelNotes: string | null;
}

interface ParcelDataForInactiveClient extends ParcelDataIndependentOfClient {
    isActive: false;
    clientId: string;
}

interface ParcelDataForActiveClient extends ParcelDataIndependentOfClient {
    isActive: true;
    clientId: string;
    fullName: string;
    address: string;
    deliveryInstructions: string;
    phoneNumber: string;
    email: string;
    household: string;
    adults: string;
    children: string;
    cookingFacilities: string;
    dietaryRequirements: string;
    hygieneProducts: string;
    babyProducts: string;
    petFood: string;
    otherRequirements: string;
    extraInformation: string;
    signpostingCall: string;
    clientNotes: string;
}

type ExpandedParcelData = ParcelDataForActiveClient | ParcelDataForInactiveClient;

export interface ExpandedParcelDetails {
    expandedParcelData: ExpandedParcelData;
    events: EventTableRow[];
}

export const formatDatetimeAsTime = (datetime: string | null): string => {
    if (datetime === null || isNaN(Date.parse(datetime))) {
        return "-";
    }

    return new Date(datetime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const formatPackingDateAndSlot = (
    packingDatetime: string | null,
    slotName: string | undefined
): string => {
    return formatDatetimeAsDate(packingDatetime) + " " + (slotName ?? "");
};

const formatDeliveryOrCollection = (
    collectionCentreName: string | undefined,
    isDelivery: boolean | undefined,
    isShown: boolean | undefined,
    collectionDatetime: string | null
): string => {
    const methodString = isShown ? collectionCentreName : `${collectionCentreName} (inactive)`;
    const collectionDateTimeString = isDelivery ? "" : formatDateTime(collectionDatetime);
    return methodString + " " + collectionDateTimeString;
};

const formatSignpostingCall = (
    signpostingCallRequired: boolean | null,
    signpostingCallReasons: string[] | null
): string => {
    if (!signpostingCallRequired) {
        return "No";
    }

    return (
        "Yes: " + formatRequirementsByCanonicalOrder(signpostingCallReasons, signpostingCallOptions)
    );
};

const formatReferralDetails = (
    referralAgency: string,
    referrerName: string,
    referrerPhone: string,
    referrerEmail: string
): string => {
    return [referralAgency, referrerName, referrerPhone, referrerEmail]
        .map((referral) => (referral ?? "").trim())
        .filter((referral) => referral.length > 0)
        .join(", ");
};

export const processEventsDetails = (
    events: Pick<Schema["events"], "event_data" | "new_parcel_status" | "timestamp">[]
): EventTableRow[] => {
    return events.map((event) => ({
        eventInfo: formatEventName(event.new_parcel_status, event.event_data),
        timestamp: new Date(event.timestamp),
    }));
};

export const getExpandedParcelDataForDataViewer = (
    parcelDetails: ExpandedParcelData
): DataForDataViewer => {
    const parcelDetailsForDataViewer = convertDataToDataForDataViewer({
        ...parcelDetails,
    });
    parcelDetailsForDataViewer["isActive"] = {
        value: parcelDetails["isActive"],
        hide: true,
    };
    parcelDetailsForDataViewer["clientId"] = {
        value: parcelDetails["clientId"],
        hide: true,
    };
    parcelDetailsForDataViewer["listType"] = {
        value: capitaliseWords(parcelDetails["listType"]),
    };

    return parcelDetailsForDataViewer;
};

export default getExpandedEmergencyBagDetails;
