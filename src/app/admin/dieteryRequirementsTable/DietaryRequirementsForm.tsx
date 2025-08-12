import { dietaryRequirementTypes } from "@/app/admin/dieteryRequirementsTable/DietaryRequirementsActions";
import { DatabaseEnums } from "@/databaseUtils";
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
import { useEffect, useState } from "react";
import Modal from "@/components/Modal/Modal";

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

export const EditDietaryRequirementsModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [items, setItems] = useState<DietaryRequirementsPlusTableRow[]>([]);
    const [selectedType, setSelectedType] = useState<string>("halal");
    const [initialIncluded, setInitialIncluded] = useState<(string | null)[]>([]);
    const [initialExcluded, setInitialExcluded] = useState<(string | null)[]>([]);
    const [newIncluded, setNewIncluded] = useState<(string | null)[]>([]);
    const [newExcluded, setNewExcluded] = useState<(string | null)[]>([]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const fetchData = async (): Promise<void> => {
            const { data, error } = await supabase
                .from("dietary_requirements_plus")
                .select()
                .order("item_name");

            if (error) {
                console.error("Error fetching dietary requirements data:", error);
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

        void fetchData();
    }, [isOpen, selectedType]);

    const handleSubmit = async (): Promise<void> => {
        const changedItems = items.filter((item) => {
            if (!item.id) {
                return false;
            }

            const wasIncluded = initialIncluded.includes(item.id);
            const wasExcluded = initialExcluded.includes(item.id);
            const isNowIncluded = newIncluded.includes(item.id);
            const isNowExcluded = newExcluded.includes(item.id);

            return wasIncluded !== isNowIncluded || wasExcluded !== isNowExcluded;
        });

        if (changedItems.length === 0) {
            onClose();
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

        if (error) {
            console.error("Error updating dietary requirements:", error);
        } else {
            onClose();
        }
    };

    const handleToggle = (id: string | null, type: "included" | "excluded"): void => {
        let toggleList = type === "included" ? newIncluded : newExcluded;
        let oppositeList = type === "included" ? newExcluded : newIncluded;

        if (toggleList.includes(id)) {
            toggleList = toggleList.filter((item) => item !== id);
        } else {
            toggleList = [...toggleList, id];
            oppositeList = oppositeList.filter((item) => item !== id);
        }

        if (type === "included") {
            setNewIncluded(toggleList);
            setNewExcluded(oppositeList);
        } else {
            setNewExcluded(toggleList);
            setNewIncluded(oppositeList);
        }
    };

    return (
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
                    onChange={(event) => {
                        setSelectedType(event.target.value);
                        // setIncluded(new Set());
                        // setExcluded(new Set());
                    }}
                >
                    {dietaryRequirementTypes.map((dietary) => (
                        <MenuItem key={dietary.key} value={dietary.key}>
                            {dietary.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

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
    );
};
