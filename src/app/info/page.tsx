import React, { ReactElement } from "react";
import { Metadata } from "next";
import InfoPage from "@/app/info/InfoPage";
import Title from "@/components/Title/Title";

const Info = async (): Promise<ReactElement<any>> => {
    return (
        <main>
            <Title>Info Page</Title>
            <InfoPage />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Info",
};

export default Info;
