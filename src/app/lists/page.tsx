import { Metadata } from "next";
import React from "react";
import Title from "@/components/Title/Title";
import ListsPage from "./ListsPage";

const Lists: () => Promise<React.ReactElement<any>> = async () => {
    return (
        <main>
            <Title>Lists</Title>
            <ListsPage />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Lists",
};

export default Lists;
