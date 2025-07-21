"use client";

import {
    fetchAllItems,
    dietaryRequirementTypes,
    ListItem,
} from "@/app/admin/dieteryRequirementsTable/DietaryRequirementsActions";
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
    open: boolean;
    onClose: () => void;
}

export const EditDietaryRequirementsModal: React.FC<Props> = ({ open, onClose }) => {
    const [items, setItems] = useState<ListItem[]>([]);
    const [selectedType, setSelectedType] = useState<string>("halal");
    const [included, setIncluded] = useState<Set<string>>(new Set());
    const [excluded, setExcluded] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!open) {
            return;
        }

        const fetchData = async (): Promise<void> => {
            const items = await fetchAllItems();
            setItems(items);

            const { data } = await supabase.from("dietary_requirements_plus").select();

            if (!data) {
                return;
            }

            const includedSet = new Set<string>();
            const excludedSet = new Set<string>();

            items.forEach((item) => {
                const row = data.find((iterRow) => iterRow.id === item.id);

                if (row) {
                    let value: string | null = null;
                    switch (selectedType) {
                        case "halal":
                            value = row.halal;
                            break;
                        case "vegetarian":
                            value = row.vegetarian;
                            break;
                        case "vegan":
                            value = row.vegan;
                            break;
                        case "meat":
                            value = row.meat;
                            break;
                        case "gluten_free":
                            value = row.gluten_free;
                            break;
                        case "pescatarian":
                            value = row.pescatarian;
                            break;
                        case "dairy_free":
                            value = row.dairy_free;
                            break;
                        case "seafood_allergy":
                            value = row.seafood_allergy;
                            break;
                        case "pet_food":
                            value = row.pet_food;
                            break;
                    }

                    if (value === "included") {
                        includedSet.add(item.id);
                    } else if (value === "excluded") {
                        excludedSet.add(item.id);
                    }
                }
            });

            setIncluded(includedSet);
            setExcluded(excludedSet);
        };

        fetchData();
    }, [open, selectedType]);

    const handleSubmit = async (): Promise<void> => {
        try {
            const allUpdates = items.map((item) => ({
                id: item.id,
                [selectedType]: "not_specified",
            }));

            included.forEach((id) => {
                const item = allUpdates.find((iterItem) => iterItem.id === id);
                if (item) {
                    item[selectedType] = "included";
                }
            });

            excluded.forEach((id) => {
                const item = allUpdates.find((iterItem) => iterItem.id === id);
                if (item) {
                    item[selectedType] = "excluded";
                }
            });

            const { error } = await supabase
                .from("dietary_requirements")
                .upsert(allUpdates, { onConflict: "id" });

            if (error) {
                throw error;
            }

            onClose();
        } catch (errorMessage) {
            alert("Error saving data.");
        }
    };

    const handleToggle = (id: string, type: "included" | "excluded"): void => {
        const toggleSet = type === "included" ? included : excluded;
        const oppositeSet = type === "included" ? excluded : included;

        const newSet = new Set(toggleSet);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
            oppositeSet.delete(id); // can't be both
        }

        if (type === "included") {
            setIncluded(newSet);
            setExcluded(new Set(oppositeSet));
        } else {
            setExcluded(newSet);
            setIncluded(new Set(oppositeSet));
        }
    };

    return (
        <Modal
            isOpen={open}
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
                        setIncluded(new Set());
                        setExcluded(new Set());
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
                                        checked={included.has(item.id)}
                                        onChange={() => handleToggle(item.id, "included")}
                                    />
                                }
                                label={item.name}
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
                                        checked={excluded.has(item.id)}
                                        onChange={() => handleToggle(item.id, "excluded")}
                                    />
                                }
                                label={item.name}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Modal>
    );
};
