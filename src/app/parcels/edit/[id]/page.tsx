import { Metadata } from "next";

import React from "react";
import EditParcelForm from "../EditParcelForm";

interface EditParcelsParameters {
    params: Promise<{ id: string }>;
}

const EditParcels = async (props: EditParcelsParameters): Promise<React.ReactElement<any>> => {
    const params = await props.params;
    return (
        <main>
            <EditParcelForm parcelId={params.id} />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Edit Parcels",
};

export default EditParcels;
