"use client";

import React from "react";
import { ActionModalProps } from "./GeneralActionModal";
import SelectedParcelsReportCsvButton from "@/app/parcels/ActionBar/ActionButtons/SelectedParcelsReportCsvButton";
import ReportModal from "./ReportModal";

const SelectedParcelsReportModal: React.FC<ActionModalProps> = (props) => {
    return (
        <ReportModal actionModalProps={{ ...props }} csvButton={SelectedParcelsReportCsvButton} />
    );
};

export default SelectedParcelsReportModal;
