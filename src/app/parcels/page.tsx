import { Metadata } from "next";
import React from "react";
import ParcelsPage from "@/app/parcels/ParcelsPage";
import Title from "@/components/Title/Title";

const Parcels: () => Promise<React.ReactElement> = async () => {
    return (
        <main>
            <Title>Parcels Page</Title>
            <ParcelsPage />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Parcels",
};

export default Parcels;
