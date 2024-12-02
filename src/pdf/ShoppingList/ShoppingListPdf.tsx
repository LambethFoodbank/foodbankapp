import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { ClientSummary, RequirementSummary } from "@/common/formatClientsData";
import { HouseholdSummary } from "@/common/formatFamiliesData";
import {
    formatCamelCaseKey,
    displayPostcodeForHomelessClient,
    capitaliseWords,
} from "@/common/format";
import { ParcelInfo } from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/getParcelsData";
import {
    Item,
    ShoppingListPdfData,
} from "@/app/parcels/ActionBar/ActionButtons/ShoppingList/shoppingListPdfDataProps";
import { faTruck, faShoePrints } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeIconPdfComponent from "@/pdf/FontAwesomeIconPdfComponent";

type BlockProps = {
    data: ParcelInfo | HouseholdSummary | RequirementSummary;
    noWrap?: boolean;
};

const styles = StyleSheet.create({
    sheet: {
        paddingTop: "0.3in",
        paddingBottom: "0.3in",
        paddingLeft: "0.25in",
    },
    page: {
        width: "97%",
        lineHeight: "1.2pt",
        flexDirection: "column",
    },
    flexRow: {
        display: "flex",
        flexDirection: "row",
    },
    flexColumn: {
        display: "flex",
        flexDirection: "column",
    },
    pdfInfoSection: {
        flexDirection: "row",
        marginBottom: "5px",
    },
    pdfInfoLeftColumn: {
        width: "80%",
        flexDirection: "column",
    },
    pdfHeader: {
        justifyContent: "space-between",
    },
    logoStyling: {
        maxWidth: "20%",
        alignSelf: "flex-start",
    },
    infoCellNoBorder: {
        width: "100%",
    },
    infoCell: {
        width: "100%",
        padding: "1pt",
        borderStyle: "solid",
        border: "1pt",
    },
    tableRow: {
        textAlign: "left",
    },
    tableItemDescription: {
        paddingVertical: "1pt",
        width: "34%",
        border: "0.5pt",
        borderStyle: "solid",
    },
    tableQuantity: {
        paddingVertical: "1pt",
        width: "20%",
        border: "0.5pt",
        borderStyle: "solid",
    },
    tableNotes: {
        paddingVertical: "1pt",
        width: "40%",
        border: "0.5pt",
        borderStyle: "solid",
    },
    tableDone: {
        paddingVertical: "1pt",
        width: "6%",
        border: "0.5pt",
        borderStyle: "solid",
    },
    title: {
        fontSize: "22pt",
        fontFamily: "Helvetica-Bold",
        paddingRight: "6pt",
    },
    subtitle: {
        fontSize: "16pt",
        fontFamily: "Helvetica-Bold",
        marginTop: "5px",
        marginBottom: "5px",
    },
    keyText: {
        fontSize: "11pt",
        fontFamily: "Helvetica-Bold",
        paddingLeft: "2pt",
    },
    normalText: {
        fontSize: "11pt",
        fontFamily: "Helvetica",
        paddingLeft: "2pt",
    },
    nonWrappingText: {
        maxLines: 1,
        textOverflow: "ellipsis",
    },
    tableCell: {
        borderStyle: "solid",
        border: "0.5pt",
    },
    itemList: {
        alignItems: "center",
        padding: "5pt",
    },
});

interface OneLineProps {
    header: string;
    value: string;
    noWrap?: boolean;
}

const shouldDisplay = (header: string, value: string): boolean => {
    return !(
        (header === "NUMBER OF BABIES" && value === "0") ||
        (header === "AGE AND GENDER OF CHILDREN" && value === "None")
    );
};

const getDisplayValue = (header: string, value: string): string => {
    switch (header) {
        case "LIST TYPE":
            return capitaliseWords(value);
        case "HOUSEHOLD SIZE":
            return value === "1 (1 Adult 0 Child)" ? "Single (1 Adult 0 Child)" : value;
        case "AGE AND GENDER OF ADULTS":
        case "AGE AND GENDER OF CHILDREN":
            return value.replace(/M/g, "Male").replace(/F/g, "Female").replace(/O/g, "Other");
        case "BABY PRODUCTS REQUIRED":
            return value.includes("No") ? "None" : value;
        default:
            return value;
    }
};

const OneLine: React.FC<OneLineProps> = ({ header, value, noWrap }) => {
    const displayValue = getDisplayValue(header, value);
    const lineStyles = noWrap === true ? [styles.keyText, styles.nonWrappingText] : styles.keyText;

    return (
        <Text style={lineStyles}>
            {header}: <Text style={styles.normalText}>{displayValue}</Text>
        </Text>
    );
};

const TableHeadings: React.FC = () => {
    return (
        <View style={[styles.flexRow, styles.tableRow]}>
            <View style={styles.tableDone}>
                <Text style={styles.keyText}>Done</Text>
            </View>
            <View style={styles.tableItemDescription}>
                <Text style={styles.keyText}>Item Description</Text>
            </View>
            <View style={styles.tableQuantity}>
                <Text style={styles.keyText}>Quantity</Text>
            </View>
            <View style={styles.tableNotes}>
                <Text style={styles.keyText}>Notes</Text>
            </View>
        </View>
    );
};

const ItemToRow: React.FC<Item> = (item) => {
    return (
        <View style={[styles.flexRow, styles.tableRow]} wrap={false}>
            <View style={styles.tableDone} />
            <View style={[styles.tableItemDescription, { justifyContent: "center" }]}>
                <Text style={[styles.normalText, { padding: "2pt" }]}>{item.description}</Text>
            </View>
            <View style={[styles.tableQuantity, { justifyContent: "center" }]}>
                <Text style={[styles.normalText, { padding: "2pt" }]}>{item.quantity}</Text>
            </View>
            <View style={[styles.tableNotes, { justifyContent: "center" }]}>
                <Text style={[styles.normalText, { padding: "2pt" }]}>{item.notes}</Text>
            </View>
        </View>
    );
};

interface DisplayItemsListProps {
    itemsList: Item[];
}

const DisplayItemsList: React.FC<DisplayItemsListProps> = ({ itemsList }) => {
    return (
        <View>
            {itemsList.map((item, index) => (
                <ItemToRow {...item} key={index} /> // eslint-disable-line react/no-array-index-key
            ))}
        </View>
    );
};

const DisplayAsBlockNoBorder: React.FC<BlockProps> = (props: BlockProps) => {
    return (
        <View style={styles.infoCellNoBorder}>
            {Object.entries(props.data)
                .filter(([propKey, propValue]) =>
                    shouldDisplay(formatCamelCaseKey(propKey), propValue)
                )
                .map(([propKey, propValue]) => (
                    <OneLine
                        key={propKey}
                        header={formatCamelCaseKey(propKey)}
                        value={propValue}
                        noWrap={props.noWrap}
                    />
                ))}
        </View>
    );
};

const DisplayAsBlock: React.FC<BlockProps> = (props: BlockProps) => {
    return (
        <View style={styles.infoCell}>
            {Object.entries(props.data)
                .filter(([propKey, propValue]) =>
                    shouldDisplay(formatCamelCaseKey(propKey), propValue)
                )
                .map(([propKey, propValue]) => (
                    <OneLine
                        key={propKey}
                        header={formatCamelCaseKey(propKey)}
                        value={propValue}
                        noWrap={props.noWrap}
                    />
                ))}
        </View>
    );
};

interface FormatClientCellProps {
    propKey: string;
    propValue: string;
}

const FormatClientCell: React.FC<FormatClientCellProps> = ({ propKey, propValue }) => {
    return (
        <View style={styles.infoCell}>
            <OneLine header={formatCamelCaseKey(propKey)} value={propValue} />
        </View>
    );
};

const DisplayClientSummary: React.FC<ClientSummary> = (clientSummary) => {
    return (
        <>
            <View style={styles.flexRow}>
                <FormatClientCell propKey="name" propValue={clientSummary.name} />
                <FormatClientCell propKey="contact" propValue={clientSummary.contact} />
            </View>
            <View style={styles.flexRow}>
                <FormatClientCell propKey="address" propValue={clientSummary.address} />
                <FormatClientCell
                    propKey="extraInformation"
                    propValue={clientSummary.extraInformation}
                />
            </View>
        </>
    );
};

interface SingleShoppingListProps {
    parcelData: ShoppingListPdfData;
}

const SingleShoppingList: React.FC<SingleShoppingListProps> = ({ parcelData }) => {
    return (
        <Page size="A4" style={styles.sheet}>
            <View style={styles.page}>
                <View style={styles.pdfInfoSection}>
                    <View style={styles.pdfInfoLeftColumn}>
                        <View style={[styles.flexRow, styles.pdfHeader]}>
                            <View style={styles.flexColumn}>
                                <View style={styles.flexRow}>
                                    <Text style={styles.title}>Shopping List</Text>
                                    <Text style={styles.title}>|</Text>
                                    <FontAwesomeIconPdfComponent
                                        faIcon={
                                            parcelData.parcelInfo.collectionSite ===
                                            "N/A - Delivery"
                                                ? faTruck
                                                : faShoePrints
                                        }
                                    ></FontAwesomeIconPdfComponent>
                                </View>
                                <Text style={styles.subtitle}>
                                    POSTCODE:{" "}
                                    {parcelData.postcode ?? displayPostcodeForHomelessClient}
                                </Text>
                            </View>
                        </View>
                        <DisplayAsBlockNoBorder data={parcelData.parcelInfo} noWrap={true} />
                    </View>
                    {/* eslint-disable-next-line jsx-a11y/alt-text -- React-PDF Image doesn't  have alt text property*/}
                    <Image src="/logo.png" style={[styles.flexRow, styles.logoStyling]} />
                </View>
                <DisplayClientSummary {...parcelData.clientSummary} />
                <View style={styles.flexRow}>
                    <DisplayAsBlock data={parcelData.householdSummary} />
                    <DisplayAsBlock data={parcelData.requirementSummary} />
                </View>
                <View>
                    <TableHeadings />
                    <DisplayItemsList itemsList={parcelData.itemsList} />
                </View>
                <View style={styles.flexColumn} wrap={false}>
                    <View style={[styles.flexRow, styles.infoCell]}>
                        <Text style={[styles.keyText]}>Warehouse Manager Notes</Text>
                    </View>
                    <View style={[styles.flexRow, styles.infoCell]}>
                        <Text style={styles.normalText}>{parcelData.endNotes}</Text>
                    </View>
                    <View style={[styles.flexRow, styles.infoCell]}>
                        <Text style={[styles.keyText, { alignSelf: "center" }]}>Date Packed:</Text>
                    </View>
                    <View style={[styles.flexRow, styles.infoCell]}>
                        <Text style={[styles.keyText, { alignSelf: "center" }]}>Packer Name:</Text>
                    </View>
                    <View style={[styles.flexRow, styles.infoCell]}>
                        <Text style={[styles.keyText, { alignSelf: "center" }]}>
                            Packer Signature:
                        </Text>
                    </View>
                </View>
            </View>
        </Page>
    );
};

interface ShoppingListPDFProps {
    data: ShoppingListPdfData[];
}

const ShoppingListPdf: React.FC<ShoppingListPDFProps> = ({ data }) => {
    return (
        <Document>
            {data.map((parcelData: ShoppingListPdfData, index: number) => {
                return <SingleShoppingList key={index} parcelData={parcelData} />; // eslint-disable-line react/no-array-index-key
            })}
        </Document>
    );
};

export default ShoppingListPdf;
