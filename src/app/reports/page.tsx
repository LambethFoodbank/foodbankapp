import { Metadata } from "next";
import React from "react";
import Title from "@/components/Title/Title";
import ReportsPage from "@/app/reports/reportsTable/ReportsPage";

const Reports: () => Promise<React.ReactElement<any>> = async () => {
    return (
        <main>
            <Title>Reports</Title>
            <ReportsPage />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Reports",
};

export default Reports;
