import { Metadata } from "next";
import React from "react";
import AddEmergencyBagForm from "@/app/emergency-bags/add/AddEmergencyBagForm";

export const metadata: Metadata = {
    title: "Add Emergency Bag",
};

const AddEmergencyBag = (): React.ReactElement => {
    return (
        <main>
            <AddEmergencyBagForm />
        </main>
    );
};

export default AddEmergencyBag;
