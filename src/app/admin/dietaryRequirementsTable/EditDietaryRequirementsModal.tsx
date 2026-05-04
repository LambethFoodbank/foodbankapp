import { dietaryRequirementTypes } from "@/app/admin/dietaryRequirementsTable/DietaryRequirementsActions";
import { DatabaseEnums } from "@/databaseUtils";
import FloatingToast from "@/components/FloatingToast";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal/Modal";
import Alert from "@mui/material/Alert";
import { sendAuditLog } from "@/server/auditLog";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type BaseDietaryRequirements = {
    halal: DatabaseEnums["item_dietary_status"] | null;
    vegetarian: DatabaseEnums["item_dietary_status"] | null;
    vegan: DatabaseEnums["item_dietary_status"] | null;
    meat: DatabaseEnums["item_dietary_status"] | null;
    gluten_free: DatabaseEnums["item_dietary_status"] | null;
    pescatarian: DatabaseEnums["item_dietary_status"] | null;
    dairy_free: DatabaseEnums["item_dietary_status"] | null;
    seafood_allergy: DatabaseEnums["item_dietary_status"] | null;
    pet_food: DatabaseEnums["item_dietary_status"] | null;
};

type DietaryRequirementsPlusTableRow = BaseDietaryRequirements & {
    id: string | null;
    item_name: string | null;
};

type DietaryRequirementsTableRow = BaseDietaryRequirements & {
    id: string;
};

function checkArraysAreEqual(
    firstArray: (string | null)[],
    secondArray: (string | null)[]
): boolean {
    if (firstArray.length !== secondArray.length) {
        return false;
    }

    const firstArrayCopy = [...firstArray];
    const secondArrayCopy = [...secondArray];

    firstArrayCopy.sort();
    secondArrayCopy.sort();

    for (let index = 0; index < firstArrayCopy.length; index++) {
        if (firstArrayCopy[index] !== secondArrayCopy[index]) {
            return false;
        }
    }
    return true;
}

export const EditDietaryRequirementsModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [items, setItems] = useState<DietaryRequirementsPlusTableRow[]>([]);
    const [selectedType, setSelectedType] = useState<keyof BaseDietaryRequirements>("halal");
    const [initialIncluded, setInitialIncluded] = useState<(string | null)[]>([]);
    const [initialExcluded, setInitialExcluded] = useState<(string | null)[]>([]);
    const [newIncluded, setNewIncluded] = useState<(string | null)[]>([]);
    const [newExcluded, setNewExcluded] = useState<(string | null)[]>([]);
    const [wasSaved, setWasSaved] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [warningSaveMessage, setWarningSaveMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchData = async (selectedType: string): Promise<void> => {
        const { data, error } = await supabase
            .from("dietary_requirements_plus")
            .select()
            .order("item_name");

        if (error) {
            setErrorMessage("Error fetching dietary requirements data");
            onClose();
            return;
        }

        setItems(data);

        const included: (string | null)[] = [
            ...data
                .filter((row) => row[selectedType as keyof typeof row] === "included")
                .map((row) => row.id),
        ];

        const excluded: (string | null)[] = [
            ...data
                .filter((row) => row[selectedType as keyof typeof row] === "excluded")
                .map((row) => row.id),
        ];

        setInitialIncluded(included);
        setInitialExcluded(excluded);

        setNewIncluded(included);
        setNewExcluded(excluded);
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        void fetchData(selectedType);

        setWasSaved(false);
        setHasChanges(false);
    }, [isOpen, selectedType]); //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (warningSaveMessage) {
            const timer = setTimeout(() => {
                setWarningSaveMessage("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [warningSaveMessage]);

    const hasItemStatusChanged = (item: DietaryRequirementsPlusTableRow): boolean => {
        if (!item.id) {
            return false;
        }

        const wasIncluded = initialIncluded.includes(item.id);
        const wasExcluded = initialExcluded.includes(item.id);
        const isNowIncluded = newIncluded.includes(item.id);
        const isNowExcluded = newExcluded.includes(item.id);

        return wasIncluded !== isNowIncluded || wasExcluded !== isNowExcluded;
    };

    const handleSubmit = async (): Promise<void> => {
        const changedItems = items.filter((item) => hasItemStatusChanged(item));

        if (changedItems.length === 0) {
            setHasChanges(false);
            setWarningSaveMessage("No changes detected.");
            return;
        }

        // Only include changed fields in the update
        const updates: DietaryRequirementsTableRow[] = changedItems.map((item) => {
            const newStatus = newIncluded.includes(item.id)
                ? "included"
                : newExcluded.includes(item.id)
                  ? "excluded"
                  : "not_specified";

            return {
                id: item.id,
                [selectedType]: newStatus as DatabaseEnums["item_dietary_status"],
            } as DietaryRequirementsTableRow;
        });

        const { error } = await supabase
            .from("dietary_requirements")
            .upsert(updates, { onConflict: "id" });

        const includedItemsName = newIncluded.map((id) => {
            const item = items.find((item) => item.id === id);
            return item ? item.item_name : "Unnamed Item";
        });

        const excludedItemsName = newExcluded.map((id) => {
            const item = items.find((item) => item.id === id);
            return item ? item.item_name : "Unnamed Item";
        });

        const label =
            dietaryRequirementTypes.find((type) => type.key === selectedType)?.label ?? "unknown";

        const auditLog = {
            action: "update dietary requirements",
            content: { included: includedItemsName, excluded: excludedItemsName },
            dietaryRequirement: label,
        };

        if (error) {
            const logId = await logErrorReturnLogId(
                `Error with updating dietary requirements for ${label}`,
                {
                    error: error,
                }
            );
            await sendAuditLog({ ...auditLog, wasSuccess: false, logId });

            setErrorMessage(`Failed to update dietary requirements for ${label}. Log ID: ${logId}`);
            return;
        }

        await sendAuditLog({ ...auditLog, wasSuccess: true });

        setWasSaved(true);
        setHasChanges(false);
        setWarningSaveMessage("");

        void fetchData(selectedType);
    };

    const handleToggle = (id: string | null, type: "included" | "excluded"): void => {
        const currentList = type === "included" ? newIncluded : newExcluded;
        const otherList = type === "included" ? newExcluded : newIncluded;

        const initialCurrent = type === "included" ? initialIncluded : initialExcluded;
        const initialOther = type === "included" ? initialExcluded : initialIncluded;

        // toggled item will be added to the current list if not present, or removed if already present
        const updatedCurrent = currentList.includes(id)
            ? currentList.filter((item) => item !== id)
            : [...currentList, id];

        // Ensure the other list does not contain the same id (item cannot be both included and excluded)
        const updatedOther = otherList.filter((item) => item !== id);

        if (type === "included") {
            setNewIncluded(updatedCurrent);
            setNewExcluded(updatedOther);
        } else {
            setNewExcluded(updatedCurrent);
            setNewIncluded(updatedOther);
        }

        setHasChanges(
            !checkArraysAreEqual(updatedCurrent, initialCurrent) ||
                !checkArraysAreEqual(updatedOther, initialOther)
        );

        if (hasChanges) {
            setWasSaved(false);
        }
    };

    const handleTypeChange = (newType: keyof BaseDietaryRequirements): void => {
        if (hasChanges) {
            return;
        }
        setSelectedType(newType);
    };

    return (
        <>
            {errorMessage && (
                <FloatingToast
                    message={errorMessage}
                    severity="warning"
                    variant="filled"
                ></FloatingToast>
            )}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                header="Edit Dietary Requirements"
                headerId="edit-dietary-requirements-modal"
                maxWidth="md"
                footer={
                    <>
                        <Button onClick={onClose} sx={{ mr: 2 }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} variant="contained">
                            Save
                        </Button>
                    </>
                }
            >
                <Box mb={3}>
                    <Typography fontWeight="bold" variant="h6">
                        Select Dietary Requirement Type:
                    </Typography>
                    <Select
                        fullWidth
                        value={selectedType}
                        onChange={(event) =>
                            handleTypeChange(event.target.value as keyof BaseDietaryRequirements)
                        }
                    >
                        {dietaryRequirementTypes.map((dietary) => (
                            <MenuItem key={dietary.key} value={dietary.key}>
                                {dietary.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {wasSaved && !hasChanges && (
                    <Alert severity="success">
                        The dietary requirement has been successfully saved.
                    </Alert>
                )}

                {hasChanges && (
                    <Alert severity="warning">
                        Please save your changes before switching the dietary requirement.
                    </Alert>
                )}

                {warningSaveMessage && !hasChanges && (
                    <Alert severity="info">{warningSaveMessage}</Alert>
                )}

                <Box sx={{ mt: 4, mb: 4 }}>
                    <Typography fontWeight="bold" variant="h6" gutterBottom>
                        Included
                    </Typography>
                    <Grid container spacing={0.5}>
                        {items.map((item) => (
                            <Grid item xs={6} sm={4} md={4} key={`included-${item.id}`}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={newIncluded.includes(item.id)}
                                            onChange={() => handleToggle(item.id, "included")}
                                        />
                                    }
                                    label={item.item_name || "Unnamed Item"}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box>
                    <Typography fontWeight="bold" variant="h6" gutterBottom>
                        Excluded
                    </Typography>
                    <Grid container spacing={0.5}>
                        {items.map((item) => (
                            <Grid item xs={6} sm={4} md={4} key={`excluded-${item.id}`}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={newExcluded.includes(item.id)}
                                            onChange={() => handleToggle(item.id, "excluded")}
                                        />
                                    }
                                    label={item.item_name || "Unnamed Item"}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Modal>
        </>
    );
};
