import { Metadata } from "next";
import React from "react";
import AddParcelForm from "../AddParcelForm";

export interface AddParcelParameters {
    params: Promise<{
        clientId: string;
    }>;
}

const AddParcel = async (props: AddParcelParameters): Promise<React.ReactElement<any>> => {
    const params = await props.params;
    return (
        <main>
            <AddParcelForm clientId={params.clientId} />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Add Parcel",
};

export default AddParcel;
