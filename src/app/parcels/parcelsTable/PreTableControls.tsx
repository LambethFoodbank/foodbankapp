import { Button } from "@mui/material";
import ActionAndStatusBar from "../ActionBar/ActionAndStatusBar";
import { ParcelsTableRow } from "./types";
import { ActionsContainer } from "@/components/controlsStyling";

interface PreTableControlsProps {
    isPackingManagerView: boolean;
    setIsPackingManagerView: (isPackingManagerView: boolean) => void;
    selectedParcelMessage: string | null;
    getCheckedParcelsData: () => Promise<ParcelsTableRow[]>;
    postCheckedParcelActivity: () => void;
}

const PreTableControls: React.FC<PreTableControlsProps> = (props) => {
    return (
        <>
            <Button
                variant={props.isPackingManagerView ? "outlined" : "contained"}
                onClick={() => props.setIsPackingManagerView(false)}
            >
                All parcels
            </Button>
            <Button
                variant={props.isPackingManagerView ? "contained" : "outlined"}
                onClick={() => props.setIsPackingManagerView(true)}
            >
                Packing manager view
            </Button>
            {props.selectedParcelMessage && <span>{props.selectedParcelMessage}</span>}
            <ActionsContainer>
                <ActionAndStatusBar
                    fetchSelectedParcels={props.getCheckedParcelsData}
                    postCheckedParcelActivity={props.postCheckedParcelActivity}
                />
            </ActionsContainer>
        </>
    );
};

export default PreTableControls;
