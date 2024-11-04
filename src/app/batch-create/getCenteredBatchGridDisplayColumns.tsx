import { GridColDef, GridPreProcessEditCellProps, GridRenderCellParams } from "@mui/x-data-grid";
import { BatchActionType, BatchTableDataState } from "@/app/batch-create/types";
import { Button } from "@mui/material";
import { isPhoneNumberValid } from "@/app/batch-create/helpers/fieldValidationFunctions";
import {
    ADDRESS_WIDTH,
    BABY_PRODUCTS_WIDTH,
    MULTILINE_POPOVER_WIDTH,
    DIETARY_REQUIREMENTS_WIDTH,
    FEMININE_PRODUCTS_WIDTH,
    LIST_TYPE_WIDTH,
    OTHER_ITEMS_WIDTH,
    PET_FOOD_WIDTH,
    BOOLEAN_CLIENT_WIDTH,
    SHIPPING_METHOD_WIDTH,
    PACKING_SLOT_WIDTH,
    COLLECTION_INFO_WIDTH,
    PERSON_WIDTH,
    ROW_NUMBER_WIDTH,
    FULL_NAME_WIDTH,
    PHONE_NUMBER_WIDTH,
    VOUCHER_NUMBER_WIDTH,
    PACKING_DATE_WIDTH,
} from "@/app/batch-create/columnWidths";
import AddressEditCell from "@/app/batch-create/inputComponents/AddressEditCell";
import ListTypeEditCell from "@/app/batch-create/inputComponents/ListTypeEditCell";
import BooleanGroupEditCell from "@/app/batch-create/inputComponents/BooleanGroupEditCell";
import { dietaryRequirementLabelsAndKeys } from "@/app/clients/form/formSections/DietaryRequirementCard";
import { feminineProductLabelsAndKeys } from "@/app/clients/form/formSections/FeminineProductCard";
import { petFoodLabelsAndKeys } from "@/app/clients/form/formSections/PetFoodCard";
import { otherItemsLabelsAndKeys } from "@/app/clients/form/formSections/OtherItemsCard";
import BabyProductsEditCell from "@/app/batch-create/inputComponents/BabyProductsEditCell";
import TextFieldEditCell from "@/app/batch-create/inputComponents/MultilinePopoverEditCell";
import BooleanClientEditCell from "@/app/batch-create/inputComponents/BooleanClientEditCell";
import ShippingMethodEditCell from "@/app/batch-create/inputComponents/ShippingMethodEditCell";
import PackingDateEditCell from "@/app/batch-create/inputComponents/PackingDateEditCell";
import PackingSlotEditCell from "@/app/batch-create/inputComponents/PackingSlotEditCell";
import CollectionInfoEditCell from "@/app/batch-create/inputComponents/CollectionInfoEditCell";
import PersonEditCell from "@/app/batch-create/inputComponents/PersonEditCell";
import RowIdComponent from "@/app/batch-create/inputComponents/rowIdComponent";

const getCenteredBatchGridDisplayColumns = (
    tableState: BatchTableDataState,
    dispatch: React.Dispatch<BatchActionType>,
    isRowCollection: { [key: number]: boolean },
    setIsRowCollection: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>
): GridColDef[] => {
    const batchGridDisplayColumns = [
        {
            field: "id",
            headerName: "Row Number",
            width: ROW_NUMBER_WIDTH,
            editable: false,
            renderCell: (gridRenderCellParams: GridRenderCellParams) => {
                if (gridRenderCellParams.row.id === 0 && gridRenderCellParams.field === "id") {
                    return (
                        <Button variant="contained" disabled={true}>
                            Apply Column
                        </Button>
                    );
                }
                return <RowIdComponent rowId={gridRenderCellParams.row.id} dispatch={dispatch} />;
            },
        },
        {
            field: "fullName",
            headerName: "Full Name *",
            width: FULL_NAME_WIDTH,
            editable: true,
        },
        {
            field: "phoneNumber",
            headerName: "Phone Number",
            width: PHONE_NUMBER_WIDTH,
            editable: true,
            preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
                const hasError: boolean = isPhoneNumberValid(params);
                if (!hasError) {
                    dispatch({
                        type: "update_cell",
                        updateCellPayload: {
                            rowId: params.id as number,
                            newValueAndFieldName: {
                                type: "client",
                                newValue: params.props.value,
                                fieldName: "phoneNumber",
                            },
                        },
                    });
                }
                return {
                    ...params.props,
                    error: hasError,
                };
            },
        },
        {
            field: "address",
            headerName: "Address *",
            type: "string",
            width: ADDRESS_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <AddressEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        tableState={tableState}
                        dispatchBatchTableAction={dispatch}
                    />
                );
            },
        },
        {
            field: "adults",
            headerName: "Adults *",
            type: "number",
            width: PERSON_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <PersonEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        personField="adultInfo"
                    />
                );
            },
        },
        {
            field: "children",
            headerName: "Children",
            type: "number",
            width: PERSON_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <PersonEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        personField="childrenInfo"
                    />
                );
            },
        },
        {
            field: "listType",
            headerName: "List Type *",
            width: LIST_TYPE_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <ListTypeEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                    />
                );
            },
        },
        {
            field: "dietaryRequirements",
            headerName: "Dietary Requirements",
            width: DIETARY_REQUIREMENTS_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <BooleanGroupEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        clientField="dietaryRequirements"
                        fieldWidth={DIETARY_REQUIREMENTS_WIDTH}
                        booleanGroupLabelAndKeys={dietaryRequirementLabelsAndKeys}
                    />
                );
            },
        },
        {
            field: "feminineProducts",
            headerName: "Feminine Products",
            width: FEMININE_PRODUCTS_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <BooleanGroupEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        clientField="feminineProducts"
                        fieldWidth={FEMININE_PRODUCTS_WIDTH}
                        booleanGroupLabelAndKeys={feminineProductLabelsAndKeys}
                    />
                );
            },
        },
        {
            field: "babyProducts",
            headerName: "Baby Products *",
            width: BABY_PRODUCTS_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <BabyProductsEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                    />
                );
            },
        },
        {
            field: "petFood",
            headerName: "Pet Food",
            width: PET_FOOD_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <BooleanGroupEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        clientField="petFood"
                        fieldWidth={PET_FOOD_WIDTH}
                        booleanGroupLabelAndKeys={petFoodLabelsAndKeys}
                    />
                );
            },
        },
        {
            field: "otherItems",
            headerName: "Other Items",
            width: OTHER_ITEMS_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <BooleanGroupEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        clientField="otherItems"
                        fieldWidth={OTHER_ITEMS_WIDTH}
                        booleanGroupLabelAndKeys={otherItemsLabelsAndKeys}
                    />
                );
            },
        },
        {
            field: "deliveryInstructions",
            headerName: "Delivery Instructions",
            width: MULTILINE_POPOVER_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <TextFieldEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        multilinePopoverField="deliveryInstructions"
                    />
                );
            },
        },
        {
            field: "extraInformation",
            headerName: "Extra Information",
            width: MULTILINE_POPOVER_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <TextFieldEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        multilinePopoverField="extraInformation"
                    />
                );
            },
        },
        {
            field: "attentionFlag",
            headerName: "Attention Flag *",
            width: BOOLEAN_CLIENT_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <BooleanClientEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        field="attentionFlag"
                    />
                );
            },
        },
        {
            field: "signpostingCall",
            headerName: "Signposting Call *",
            width: BOOLEAN_CLIENT_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <BooleanClientEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        field="signpostingCall"
                    />
                );
            },
        },
        {
            field: "notes",
            headerName: "Notes",
            width: MULTILINE_POPOVER_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <TextFieldEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        multilinePopoverField="notes"
                    />
                );
            },
        },
        {
            field: "voucherNumber",
            headerName: "Voucher Number",
            width: VOUCHER_NUMBER_WIDTH,
            editable: true,
        },
        {
            field: "packingDate",
            headerName: "Packing Date *",
            width: PACKING_DATE_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <PackingDateEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                    />
                );
            },
        },
        {
            field: "packingSlot",
            headerName: "Packing Slot *",
            width: PACKING_SLOT_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <PackingSlotEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                    />
                );
            },
        },
        {
            field: "shippingMethod",
            headerName: "Shipping Method *",
            width: SHIPPING_METHOD_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <ShippingMethodEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        setIsRowCollection={setIsRowCollection}
                    />
                );
            },
        },
        {
            field: "collectionInfo",
            headerName: "Collection Info",
            width: COLLECTION_INFO_WIDTH,
            editable: true,
            renderEditCell: (gridRenderCellParams: GridRenderCellParams): React.ReactNode => {
                return (
                    <CollectionInfoEditCell
                        gridRenderCellParams={gridRenderCellParams}
                        dispatchBatchTableAction={dispatch}
                        tableState={tableState}
                        isRowCollection={isRowCollection}
                        setIsRowCollection={setIsRowCollection}
                    />
                );
            },
        },
    ];
    return batchGridDisplayColumns.map((column) => {
        return { ...column, headerAlign: "center", align: "center" };
    });
};

export default getCenteredBatchGridDisplayColumns;
