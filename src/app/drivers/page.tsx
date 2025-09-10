import React, { ReactElement } from "react";
import Title from "@/components/Title/Title";
import { Metadata } from "next";
import DriversTable from "@/app/drivers/driversTable/DriversTable";

// disables caching
export const revalidate = 0;

const Drivers = async (): Promise<ReactElement> => {
    return (
        <main>
            <Title>Drivers Page</Title>
            <DriversTable />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Drivers",
};

export default Drivers;
