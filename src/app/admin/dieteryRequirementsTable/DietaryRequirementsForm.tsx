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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

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
        if (!open) return;

        const fetchData = async (): Promise<void> => {
            const items = await fetchAllItems();
            setItems(items);

            const { data } = await supabase.from("dietary_requirements_plus").select();
            if (!data) return;

            const includedSet = new Set<string>();
            const excludedSet = new Set<string>();

            items.forEach((item) => {
                const row = data.find((r) => r.id === item.id);
                if (row) {
                    const value = row[selectedType];
                    if (value === "included") includedSet.add(item.id);
                    if (value === "excluded") excludedSet.add(item.id);
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
                const item = allUpdates.find((i) => i.id === id);
                if (item) item[selectedType] = "included";
            });

            excluded.forEach((id) => {
                const item = allUpdates.find((i) => i.id === id);
                if (item) item[selectedType] = "excluded";
            });

            const { error } = await supabase
                .from("dietary_requirements")
                .upsert(allUpdates, { onConflict: "id" });

            if (error) throw error;

            onClose();
        } catch (e) {
            alert("Error saving data. Check console.");
            console.error(e);
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
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Edit Dietary Requirements</DialogTitle>
            <DialogContent>
                <Box mb={2}>
                    <Typography>Select Dietary Requirement Type:</Typography>
                    <Select
                        fullWidth
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            setIncluded(new Set());
                            setExcluded(new Set());
                        }}
                    >
                        {dietaryRequirementTypes.map((d) => (
                            <MenuItem key={d.key} value={d.key}>
                                {d.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={6}>
                        <Typography fontWeight="bold">Included</Typography>
                        {items.map((item) => (
                            <FormControlLabel
                                key={item.id}
                                control={
                                    <Checkbox
                                        checked={included.has(item.id)}
                                        onChange={() => handleToggle(item.id, "included")}
                                    />
                                }
                                label={item.name}
                            />
                        ))}
                    </Grid>
                    <Grid item xs={6}>
                        <Typography fontWeight="bold">Excluded</Typography>
                        {items.map((item) => (
                            <FormControlLabel
                                key={item.id}
                                control={
                                    <Checkbox
                                        checked={excluded.has(item.id)}
                                        onChange={() => handleToggle(item.id, "excluded")}
                                    />
                                }
                                label={item.name}
                            />
                        ))}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
