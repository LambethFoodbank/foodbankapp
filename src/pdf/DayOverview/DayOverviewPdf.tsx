"use client";

import React from "react";
import { Svg, Document, Page, Text, View, StyleSheet, Path } from "@react-pdf/renderer";
import { faFlag, faSquare, IconDefinition, faCopyright } from "@fortawesome/free-solid-svg-icons";
import {
    DayOverviewPdfData,
    ParcelForDayOverview,
} from "@/app/parcels/ActionBar/ActionButtons/DayOverviewPdfButton";
import FontAwesomeIconPdfComponent from "../FontAwesomeIconPdfComponent";
import { displayPostcodeForHomelessClient } from "@/common/format";

interface DayOverviewRowProps {
    parcel: ParcelForDayOverview;
}

interface DayOverviewContentProps {
    parcels: ParcelForDayOverview[];
}

interface DayOverviewPdfProps {
    data: DayOverviewPdfData;
}

interface CustomSVGProps {
    icon: IconDefinition;
    color: string;
    fill: boolean;
}

const styles = StyleSheet.create({
    page: {
        display: "flex",
        flexDirection: "column",
        padding: "0 30pt 15pt",
        fontSize: "8.5pt",
    },
    margin: { height: "30pt" },
    titleRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: "5px",
    },
    title: {
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        fontSize: "20pt",
    },
    svg: {
        margin: "0 0.75pt",
        padding: "0 0.75pt",
    },
    row: { display: "flex", flexDirection: "row" },
    bold: { fontFamily: "Helvetica-Bold" },
    cell: {
        borderStyle: "solid",
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: "1.5pt",
    },

    cellLogo: { flex: 1 },
    cellName: { flex: 5.2 },
    cellPostcode: {
        flex: 2.3,
    },
    cellSlot: { flex: 1.2 },
    cellCollection: {
        flex: 2.5,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    cellInstructions: { flex: 10 },
});

const CustomSVG: React.FC<CustomSVGProps> = ({ icon, color, fill }) => {
    const svgPath = icon.icon[4];
    const formattedSvgPath = typeof svgPath === "string" ? svgPath : svgPath[0];

    return (
        <Svg width={11} height={11} viewBox="0 0 512 512" style={styles.svg}>
            <Path
                fill={fill ? color : undefined}
                stroke={color}
                strokeWidth={40}
                d={formattedSvgPath}
            />
        </Svg>
    );
};

const DayOverviewMargin: React.FC = () => {
    return <View style={styles.margin} fixed></View>;
};

const DayOverviewHeader: React.FC = () => {
    return (
        <View style={[styles.row, styles.bold, { borderTop: "1 solid black" }]} fixed>
            <Text style={[styles.cellLogo, styles.cell]}></Text>
            <Text style={[styles.cellName, styles.cell]}>Name</Text>
            <Text style={[styles.cellPostcode, styles.cell]}>Postcode</Text>
            <Text style={[styles.cellSlot, styles.cell]}>Slot</Text>
            <Text style={[styles.cellCollection, styles.cell]}>Collection</Text>
            <Text style={[styles.cellInstructions, styles.cell]}>Instructions</Text>
        </View>
    );
};

const DayOverviewRow: React.FC<DayOverviewRowProps> = ({ parcel }) => {
    return (
        <View style={styles.row} wrap={false}>
            <View style={[styles.cellLogo, styles.cell, styles.row]}>
                <CustomSVG icon={faSquare} color="black" fill={false} />
                {parcel.client_flagged_for_attention && (
                    <CustomSVG icon={faFlag} color="orange" fill={true} />
                )}
            </View>
            <Text style={[styles.cellName, styles.cell]}>
                {parcel.client_full_name ?? "Name unknown"}
            </Text>
            <Text style={[styles.cellPostcode, styles.cell]}>
                {parcel.client_address_postcode ?? displayPostcodeForHomelessClient}
            </Text>
            <Text style={[styles.cellSlot, styles.cell]}>{parcel.packing_slot_name ?? ""}</Text>
            <View style={[styles.cellCollection, styles.cell]}>
                <Text>{parcel.collection_centre_acronym ?? ""} </Text>
                {parcel.is_delivery && parcel.congestionChargeApplies && (
                    <FontAwesomeIconPdfComponent
                        faIcon={faCopyright}
                        color="red"
                        styleWidth="10px"
                    />
                )}
            </View>
            <Text style={[styles.cellInstructions, styles.cell]}>
                {parcel.client_delivery_instructions ?? ""}
            </Text>
        </View>
    );
};

const DayOverviewContent: React.FC<DayOverviewContentProps> = ({ parcels }) => {
    return (
        <View style={{ borderLeft: "1 solid black" }}>
            <DayOverviewHeader />
            {parcels.map((parcel) => (
                <DayOverviewRow key={parcel.parcel_id} parcel={parcel} />
            ))}
        </View>
    );
};

const dateStringForToday = (): string => {
    const today = new Date();
    return today.toLocaleDateString();
};

const DayOverviewPdf: React.FC<DayOverviewPdfProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <DayOverviewMargin />
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Day Overview</Text>
                    <Text style={styles.title}>{dateStringForToday()}</Text>
                </View>
                <DayOverviewContent parcels={data.parcels} />
                <DayOverviewMargin />
            </Page>
        </Document>
    );
};

export default DayOverviewPdf;
