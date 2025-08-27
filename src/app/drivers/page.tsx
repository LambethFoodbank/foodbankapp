import React, { ReactElement } from "react";
import Title from "@/components/Title/Title";
import { Metadata } from "next";
import DriversPage from "@/app/drivers/DriversPage";

// disables caching
export const revalidate = 0;

const Drivers = async (): Promise<ReactElement> => {
    return (
        <main>
            <Title>Drivers Page</Title>
            <DriversPage />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Drivers",
};

export default Drivers;
