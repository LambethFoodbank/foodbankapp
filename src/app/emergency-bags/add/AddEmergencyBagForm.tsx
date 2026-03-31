"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { returnPathQueryParam } from "@/common/constants";
import { parseQueryParams } from "@/common/urlQueryParams";
import EmergencyBagForm, {
    initialEmergencyBagFields,
    initialEmergencyBagFormErrors,
} from "@/app/emergency-bags/form/EmergencyBagForm";
import { insertEmergencyBag } from "@/app/emergency-bags/form/submitFormHelpers";

const AddEmergencyBagForm: () => React.ReactElement = () => {
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
                initialFields={initialEmergencyBagFields}
                initialFormErrors={initialEmergencyBagFormErrors}
                returnPath={returnPath}
                writeEmergencyBagInfoToDatabase={insertEmergencyBag}
            />
        </main>
    );
};

export default AddEmergencyBagForm;
