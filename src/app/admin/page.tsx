import React, { ReactElement } from "react";
import Title from "@/components/Title/Title";
import { Metadata } from "next";
import AdminPage from "@/app/admin/AdminPage";

// disables caching
export const revalidate = 0;

const Admin = async (): Promise<ReactElement<any>> => {
    return (
        <main>
            <Title>Admin Panel</Title>
            <AdminPage />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Admin",
};

export default Admin;
