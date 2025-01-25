"use client";

import React from "react";
import { Text, Document, Page, View, StyleSheet, Image } from "@react-pdf/renderer";
import {
    displayNameForNullDriverName,
    displayPostcodeForHomelessClient,
    formatDate,
} from "@/common/format";
import { faTruck, faShoePrints, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeIconPdfComponent from "@/pdf/FontAwesomeIconPdfComponent";

export interface DriverOverviewRowData {
    name: string;
    address: {
        line1: string;
        line2: string | null;
        town: string | null;
        county: string | null;
        postcode: string | null;
    };
    contact?: string;
    packingDate: string | null;
    instructions?: string;
    clientIsActive: boolean;
    numberOfLabels: number | null;
    collectionCentre: string;
    isDelivery: boolean;
}

export interface DriverOverviewCardDataProps {
    driverName: string | null;
    date: Date;
    tableData: DriverOverviewTablesData;
    message: string;
}

interface DriverOverviewCardProps {
    data: DriverOverviewCardDataProps;
}

enum Method {
    Delivery = "Delivery",
    Collection = "Collection",
}

export type DriverOverviewTablesData = {
    collections: DriverOverviewRowData[];
    deliveries: DriverOverviewRowData[];
};

const styles = StyleSheet.create({
    container: {
        padding: 25,
        alignItems: "center",
        fontFamily: "Helvetica",
    },
    infoAndLogoContainer: {
        height: 100,
        width: "100%",
    },
    informationContainer: {
        border: "1 solid black",
        margin: 10,
        padding: 10,
        width: "100%",
        alignItems: "center",
        lineHeight: 1.5,
    },
    h1text: {
        fontSize: 24,
        paddingRight: 20,
        paddingBottom: 5,
    },
    h2text: {
        fontSize: 14,
    },
    h3text: {
        fontSize: 10,
    },
    logoStyling: {
        maxHeight: 60,
        maxWidth: 102, // maintains aspect ratio of logo
        align: "left",
        marginRight: 15,
    },
    warningSection: {
        width: "100%",
        paddingBottom: 10,
    },
    tableContainer: {
        width: "100%",
    },
    tableSection: {
        width: "100%",
        marginBottom: "15px",
    },
    tableRow: {
        width: "100%",
        fontSize: 10,
        borderLeft: "1px solid black",
        borderBottom: "1px solid black",
        lineHeight: 1.5,
    },
    tableColumn: {
        padding: 5,
        borderRight: "1px solid black",
    },
    flexColumn: {
        flexDirection: "column",
        display: "flex",
    },
    flexRow: {
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
    },
    tableHeader: {
        fontSize: 12,
        borderLeft: "1px solid black",
        borderBottom: "1px solid black",
        borderTop: "1px solid black",
        height: 40,
    },
    nameColumnWidth: {
        width: "15%",
    },
    addressColumnWidth: {
        width: "20%",
    },
    contactColumnWidth: {
        width: "15%",
    },
    packingDateColumnWidth: {
        width: "13%",
    },
    numberOfLabelsColumnWidth: {
        width: "8%",
    },
    instructionsColumnWidth: {
        width: "40%",
    },
    collectionOrDeliveryHeader: {
        marginRight: "5px",
        marginBottom: "5px",
        alignSelf: "flex-start",
        fontSize: 15,
        backgroundColor: "#d3d3d3",
    },
    DriverOverviewBoard: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
    },
});

const DriverOverviewCard: React.FC<DriverOverviewCardProps> = ({ data }) => {
    const createHeader = (category: Method): React.JSX.Element => {
        return (
            <View
                style={[
                    styles.tableHeader,
                    styles.flexRow,
                    {
                        textDecoration: "underline",
                        fontFamily: "Helvetica-Bold",
                        fontSize: 13,
                    },
                ]}
            >
                <View style={[styles.tableColumn, styles.nameColumnWidth]}>
                    <Text>Name</Text>
                </View>
                <View style={[styles.tableColumn, styles.addressColumnWidth]}>
                    <Text>{category === Method.Collection ? "Collection Centre" : "Address"}</Text>
                </View>
                <View style={[styles.tableColumn, styles.contactColumnWidth]}>
                    <Text>Contact</Text>
                </View>
                <View style={[styles.tableColumn, styles.packingDateColumnWidth]}>
                    <Text>Packing Date</Text>
                </View>
                <View style={[styles.tableColumn, styles.numberOfLabelsColumnWidth]}>
                    <Text>Parcels</Text>
                </View>
                <View style={[styles.tableColumn, styles.instructionsColumnWidth]}>
                    <Text>Instructions</Text>
                </View>
            </View>
        );
    };

    const createRow = (rowData: DriverOverviewRowData, index: number): React.JSX.Element => {
        return (
            // eslint-disable-next-line react/no-array-index-key
            <View key={index} style={[styles.tableRow, styles.flexRow]} wrap={false}>
                <View style={[styles.tableColumn, styles.nameColumnWidth]}>
                    <Text>{rowData.name}</Text>
                </View>
                <View style={[styles.tableColumn, styles.addressColumnWidth]}>
                    {rowData.isDelivery ? (
                        rowData.address.postcode || rowData.clientIsActive ? (
                            <>
                                <Text>{rowData.address.line1}</Text>
                                <Text>{rowData.address.line2}</Text>
                                <Text>{rowData.address.town}</Text>
                                <Text>{rowData.address.county}</Text>
                                <Text>{rowData.address.postcode}</Text>
                            </>
                        ) : (
                            <Text>
                                {rowData.clientIsActive ? displayPostcodeForHomelessClient : "-"}
                            </Text>
                        )
                    ) : (
                        <>
                            <Text>{rowData.collectionCentre}</Text>
                        </>
                    )}
                </View>
                <View style={[styles.tableColumn, styles.contactColumnWidth]}>
                    <Text>{rowData.contact}</Text>
                </View>
                <View style={[styles.tableColumn, styles.packingDateColumnWidth]}>
                    <Text>{rowData.packingDate || "No recorded date"}</Text>
                </View>
                <View style={[styles.tableColumn, styles.numberOfLabelsColumnWidth]}>
                    <Text>{rowData.numberOfLabels || "Unknown"}</Text>
                </View>
                <View style={[styles.tableColumn, styles.instructionsColumnWidth]}>
                    <Text>{rowData.instructions}</Text>
                </View>
            </View>
        );
    };

    const createTable = (
        name: string,
        header: React.JSX.Element,
        tableRows: React.JSX.Element[],
        icon: IconDefinition
    ): React.JSX.Element => {
        return (
            <View style={styles.tableContainer}>
                <View style={[styles.h2text, styles.collectionOrDeliveryHeader, styles.flexRow]}>
                    <Text
                        style={[
                            styles.collectionOrDeliveryHeader,
                            { fontFamily: "Helvetica-Bold" },
                        ]}
                    >
                        {name}
                    </Text>
                    <FontAwesomeIconPdfComponent faIcon={icon}></FontAwesomeIconPdfComponent>
                </View>
                <View style={[styles.flexColumn, { width: "100%" }]}>{header}</View>
                <View style={[styles.tableSection, styles.flexColumn]}>{tableRows}</View>
            </View>
        );
    };

    const deliveriesHeader: React.JSX.Element = createHeader(Method.Delivery);
    const collectionsHeader: React.JSX.Element = createHeader(Method.Collection);
    const collections: React.JSX.Element[] = data.tableData.collections
        .filter((row) => row.name !== "Deleted Client")
        .map(createRow);
    const deliveries: React.JSX.Element[] = data.tableData.deliveries
        .filter((row) => row.name !== "Deleted Client")
        .map(createRow);

    const collectionsTable = createTable(
        "Collections",
        collectionsHeader,
        collections,
        faShoePrints
    );
    const deliveriesTable = createTable("Deliveries", deliveriesHeader, deliveries, faTruck);

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={[styles.container, styles.flexColumn]}>
                <View style={styles.DriverOverviewBoard}>
                    <View style={{ flexDirection: "column", fontFamily: "Helvetica-Bold" }}>
                        <Text style={[styles.h1text, { marginBottom: "10px" }]}>
                            Driver Overview
                        </Text>
                        <Text style={[styles.h2text, { marginBottom: "10px" }]}>
                            Driver Name: {data.driverName ?? displayNameForNullDriverName}
                        </Text>
                        <Text style={[styles.h3text, { marginBottom: "10px" }]}>
                            Date: {formatDate(data.date)}{" "}
                        </Text>
                    </View>
                    {/* eslint-disable-next-line -- needed to remove the need for alt text on the logo */}
                    <Image src="/logo.png" style={styles.logoStyling}></Image>
                </View>
                {deliveries.length && deliveriesTable}
                {collections.length && collectionsTable}
                <View style={[styles.informationContainer, { alignSelf: "center" }]}>
                    <Text style={[styles.h3text, { textAlign: "center", marginBottom: "5px" }]}>
                        {data.message}
                    </Text>
                    <Text
                        style={[
                            styles.h3text,
                            { fontFamily: "Helvetica-Bold", textAlign: "center" },
                        ]}
                    >
                        THIS SHEET MUST BE DESTROYED OR RETURNED TO THE WAREHOUSE IMMEDIATELY ON
                        COMPLETION OF DELIVERIES
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default DriverOverviewCard;
