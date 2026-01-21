import { Metadata } from "next";
import React from "react";
import Title from "@/components/Title/Title";
import AuditLogPage from "./AuditLogTable/AuditLogPage";

const Logs: () => Promise<React.ReactElement> = async () => {
    return (
        <main>
            <Title>Logs Page</Title>
            <AuditLogPage />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Logs",
};

export default Logs;
