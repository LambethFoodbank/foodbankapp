import { Metadata } from "next";
import React from "react";
import ClientForm, { ClientErrors, ClientFields } from "@/app/clients/form/ClientForm";
import { Errors } from "@/components/Form/formFunctions";

const AddClients: () => React.ReactElement = () => {
    const initialFields: ClientFields = {
        fullName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        addressTown: "",
        addressCounty: "",
        addressPostcode: "",
        adults: [],
        numberOfAdults: 0,
        numberOfChildren: 0,
        children: [],
        listType: null,
        cookingFacilities: {},
        dietaryRequirements: null,
        feminineProducts: {},
        babyProducts: null,
        nappySize: "",
        petFood: {},
        otherItems: {},
        deliveryInstructions: "",
        extraInformation: "",
        attentionFlag: false,
        signpostingCall: false,
        signpostingCallReasons: {},
        notes: "",
        lastUpdated: undefined,
    };

    const initialFormErrors: ClientErrors = {
        fullName: Errors.initial,
        phoneNumber: Errors.none,
        addressLine1: Errors.initial,
        addressPostcode: Errors.initial,
        numberOfAdults: Errors.initial,
        numberOfChildren: Errors.initial,
        listType: Errors.initial,
        nappySize: Errors.none,
        deliveryInstructions: Errors.none,
    };

    return (
        <main>
            <ClientForm
                initialFields={initialFields}
                initialFormErrors={initialFormErrors}
                editConfig={{ editMode: false }}
            />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Add Clients",
};

export default AddClients;
