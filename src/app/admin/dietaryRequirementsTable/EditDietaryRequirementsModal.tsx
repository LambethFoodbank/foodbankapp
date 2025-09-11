import FloatingToast from "@/components/FloatingToast";
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
import { faHotel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal/Modal";
import Alert from "@mui/material/Alert";
import { sendAuditLog } from "@/server/auditLog";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Diet = {
    primary_key: string;
    name: string;
    notes?: string | null;
};

type DietaryRule = {
    diet_id: string;
    item_id: string;
    status: "included" | "excluded" | "not_specified";
};

type Item = {
    id: string;
    item_name: string | null;
    item_type: string | null;
    list_type: string | null;
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
    const [diets, setDiets] = useState<Diet[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedDietId, setSelectedDietId] = useState<string>("");
    const [initialIncluded, setInitialIncluded] = useState<string[]>([]);
    const [initialExcluded, setInitialExcluded] = useState<string[]>([]);
    const [newIncluded, setNewIncluded] = useState<string[]>([]);
    const [newExcluded, setNewExcluded] = useState<string[]>([]);
    const [wasSaved, setWasSaved] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [warningSaveMessage, setWarningSaveMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchData = async (dietId: string): Promise<void> => {
        const { data: dietsData, error } = await supabase.from("diets").select();

        if (error) {
            setErrorMessage("Error fetching dietary requirements data");
            onClose();
            return;
        }

        setDiets(dietsData ?? []);

        const { data: itemsData } = await supabase
            .from("lists")
            .select("primary_key, item_name, item_type, list_type")
            .in("item_type", ["alternative_food", "regular_food", "choice_food"])
            .order("list_type")
            .order("item_name");
        setItems(
            (itemsData ?? []).map((item) => ({
                id: item.primary_key,
                item_name: item.item_name,
                item_type: item.item_type,
                list_type: item.list_type,
            }))
        );

        const { data: rulesData } = await supabase
            .from("dietary_rules")
            .select()
            .eq("diet_id", dietId);

        const included = (rulesData ?? [])
            .filter((rule) => rule.status === "included")
            .map((rule) => rule.item_id);
        const excluded = (rulesData ?? [])
            .filter((rule) => rule.status === "excluded")
            .map((rule) => rule.item_id);

        setInitialIncluded(included);
        setInitialExcluded(excluded);

        setNewIncluded(included);
        setNewExcluded(excluded);
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        (async () => {
            const { data: dietsData } = await supabase.from("diets").select();
            setDiets(dietsData ?? []);
            if (dietsData && dietsData.length > 0) {
                setSelectedDietId(dietsData[0].primary_key);
                await fetchData(dietsData[0].primary_key);
            }
        })();
        setWasSaved(false);
        setHasChanges(false);
    }, [isOpen]);

    useEffect(() => {
        if (selectedDietId) {
            void fetchData(selectedDietId);
            setWasSaved(false);
            setHasChanges(false);
        }
    }, [selectedDietId]);

    useEffect(() => {
        if (warningSaveMessage) {
            const timer = setTimeout(() => {
                setWarningSaveMessage("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [warningSaveMessage]);

    const hasItemStatusChanged = (itemId: string): boolean => {
        const wasIncluded = initialIncluded.includes(itemId);
        const wasExcluded = initialExcluded.includes(itemId);
        const isNowIncluded = newIncluded.includes(itemId);
        const isNowExcluded = newExcluded.includes(itemId);
        return wasIncluded !== isNowIncluded || wasExcluded !== isNowExcluded;
    };

    const handleSubmit = async (): Promise<void> => {
        const changedItemIds = items
            .map((item) => item.id)
            .filter((id) => hasItemStatusChanged(id));

        if (changedItemIds.length === 0) {
            setHasChanges(false);
            setWarningSaveMessage("No changes detected.");
            return;
        }

        const { error: delError } = await supabase
            .from("dietary_rules")
            .delete()
            .eq("diet_id", selectedDietId)
            .in("item_id", changedItemIds);

        if (delError) {
            setErrorMessage("Failed to update dietary rules (delete phase).");
            return;
        }

        const newRules: DietaryRule[] = [
            ...newIncluded
                .filter((item_id) => changedItemIds.includes(item_id))
                .map((item_id) => ({
                    diet_id: selectedDietId,
                    item_id,
                    status: "included" as const,
                })),
            ...newExcluded
                .filter((item_id) => changedItemIds.includes(item_id))
                .map((item_id) => ({
                    diet_id: selectedDietId,
                    item_id,
                    status: "excluded" as const,
                })),
        ];

        if (newRules.length > 0) {
            const { error: insError } = await supabase.from("dietary_rules").insert(newRules);
            if (insError) {
                setErrorMessage("Failed to update dietary rules (insert phase).");
                return;
            }
        }

        const includedItemsName = newIncluded.map((id) => {
            const item = items.find((item) => item.id === id);
            return item ? item.item_name : "Unnamed Item";
        });

        const excludedItemsName = newExcluded.map((id) => {
            const item = items.find((item) => item.id === id);
            return item ? item.item_name : "Unnamed Item";
        });

        const label = diets.find((diet) => diet.primary_key === selectedDietId)?.name ?? "unknown";

        const auditLog = {
            action: "update dietary requirements",
            content: { included: includedItemsName, excluded: excludedItemsName },
            dietaryRequirement: label,
        };
        await sendAuditLog({ ...auditLog, wasSuccess: true });

        setWasSaved(true);
        setHasChanges(false);
        setWarningSaveMessage("");
        void fetchData(selectedDietId);
    };

    const handleToggle = (id: string, type: "included" | "excluded"): void => {
        const currentList = type === "included" ? newIncluded : newExcluded;
        const initialCurrent = type === "included" ? initialIncluded : initialExcluded;

        // toggled item will be added to the current list if not present, or removed if already present
        const updatedCurrent = currentList.includes(id)
            ? currentList.filter((item) => item !== id)
            : [...currentList, id];

        if (type === "included") {
            setNewIncluded(updatedCurrent);
        } else {
            setNewExcluded(updatedCurrent);
        }

        setHasChanges(!checkArraysAreEqual(updatedCurrent, initialCurrent));

        if (hasChanges) {
            setWasSaved(false);
        }
    };

    const handleDietChange = (dietId: string): void => {
        if (hasChanges) {
            return;
        }
        setSelectedDietId(dietId);
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
                        value={selectedDietId}
                        onChange={(event) => handleDietChange(event.target.value as string)}
                    >
                        {diets.map((diet) => (
                            <MenuItem key={diet.primary_key} value={diet.primary_key}>
                                {diet.name}
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
                        {items
                            .filter((item) => item.item_type === "alternative_food")
                            .map((item) => (
                                <Grid item xs={6} sm={4} md={4} key={`included-${item.id}`}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={newIncluded.includes(item.id)}
                                                onChange={() => handleToggle(item.id, "included")}
                                            />
                                        }
                                        label={
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                {item.item_name ?? "Unnamed Item"}
                                                {item.list_type === "hotel" && (
                                                    <FontAwesomeIcon icon={faHotel} size="sm" />
                                                )}
                                            </Box>
                                        }
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
                        {items
                            .filter(
                                (item) =>
                                    item.item_type === "regular_food" ||
                                    item.item_type === "choice_food"
                            )
                            .map((item) => (
                                <Grid item xs={6} sm={4} md={4} key={`excluded-${item.id}`}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={newExcluded.includes(item.id)}
                                                onChange={() => handleToggle(item.id, "excluded")}
                                            />
                                        }
                                        label={
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                {item.item_name ?? "Unnamed Item"}
                                                {item.list_type === "hotel" && (
                                                    <FontAwesomeIcon icon={faHotel} size="sm" />
                                                )}
                                            </Box>
                                        }
                                    />
                                </Grid>
                            ))}
                    </Grid>
                </Box>
            </Modal>
        </>
    );
};
