"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { returnPathQueryParam } from "@/common/constants";
import { parseQueryParams } from "@/common/urlQueryParams";
import ClientForm, { ClientErrors, ClientFields } from "@/app/clients/form/ClientForm";
import { Errors } from "@/components/Form/formFunctions";

const AddClients: () => React.ReactElement<any> = () => {
    const initialFields: ClientFields = {
        fullName: "",
        phoneNumber: "",
        email: "",
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
        cookingFacilities: null,
        dietaryRequirements: null,
        hygieneProductsTampons: null,
        hygieneProductsPads: null,
        hygieneOtherItems: {},
        babyFood: null,
        babyFormula: null,
        babyNappies: null,
        babyOtherItems: {},
        petFood: {},
        otherItems: {},
        deliveryInstructions: "",
        notes: "",
        lastUpdated: undefined,
        additionalPhoneNumbers: [],
    };

    const initialFormErrors: ClientErrors = {
        fullName: Errors.initial,
        phoneNumber: Errors.none,
        additionalPhoneNumbers: [],
        email: Errors.none,
        addressLine1: Errors.initial,
        addressPostcode: Errors.initial,
        numberOfAdults: Errors.initial,
        numberOfChildren: Errors.initial,
        listType: Errors.initial,
        deliveryInstructions: Errors.none,
    };

    const searchParams = useSearchParams();
    const [returnPath, setReturnPath] = useState<string | null>(null);

    useEffect(() => {
        const urlQueryParams = parseQueryParams(searchParams.toString());
        if (urlQueryParams[returnPathQueryParam]) {
            setReturnPath(urlQueryParams[returnPathQueryParam] as string);
        }
    }, [searchParams]);

    return (
        <main>
            <ClientForm
                initialFields={initialFields}
                initialFormErrors={initialFormErrors}
                editConfig={{ editMode: false }}
                returnPath={returnPath}
            />
        </main>
    );
};

export default AddClients;
