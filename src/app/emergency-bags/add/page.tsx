"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { returnPathQueryParam } from "@/common/constants";
import { parseQueryParams } from "@/common/urlQueryParams";
import { Errors } from "@/components/Form/formFunctions";
import EmergencyBagForm, {
    EmergencyBagErrors,
    EmergencyBagFields,
} from "@/app/emergency-bags/AddEmergencyBagForm";

const AddEmergencyBag: () => React.ReactElement = () => {
    const initialFields: EmergencyBagFields = {
        type: "",
        createdAt: "",
        collectionCentre: "",
        packingDate: "",
        amount: 0,
    };

    const initialFormErrors: EmergencyBagErrors = {
        type: Errors.initial,
        collectionCentre: Errors.initial,
        packingDate: Errors.initial,
        amount: Errors.initial,
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
            <EmergencyBagForm
                initialFields={initialFields}
                initialFormErrors={initialFormErrors}
                editConfig={{ editMode: false }}
                returnPath={returnPath}
            />
        </main>
    );
};

export default AddEmergencyBag;
