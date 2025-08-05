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
    isOpen: boolean;
    onClose: () => void;
}

export const EditDietaryRequirementsModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [items, setItems] = useState<ListItem[]>([]);
    const [selectedType, setSelectedType] = useState<string>("halal");
    const [included, setIncluded] = useState<Set<string>>(new Set());
    const [excluded, setExcluded] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const fetchData = async (): Promise<void> => {
            const items = await fetchAllItems();
            setItems(items);

            const { data, error } = await supabase.from("dietary_requirements_plus").select();

            if (error) {
                console.error("Error fetching dietary requirements data:", error);
                return;
            }

            const includedSet = new Set<string>();
            const excludedSet = new Set<string>();

            items.forEach((item) => {
                const row = data.find((iterRow) => iterRow.id === item.id);

                if (row) {
                    const value = row[selectedType as keyof typeof row] || null;

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
    }, [isOpen, selectedType]);

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
